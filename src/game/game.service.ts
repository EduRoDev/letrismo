import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameSession } from './game.entity';
import { User } from '../user/user.entity';
import { Level } from '../levels/levels.entity';
import { Word } from '../words/words.entity';
import { ProgressService } from '../progress/progress.service';

@Injectable()
export class GameService {
    constructor(
        @InjectRepository(GameSession)
        private readonly gameRepo: Repository<GameSession>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Level)
        private readonly levelRepo: Repository<Level>,
        @InjectRepository(Word)
        private readonly wordRepo: Repository<Word>,
        private readonly progressService: ProgressService,
    ) {}

    // Iniciar una nueva sesión de juego
    async startGame(userName: string, levelNumber: number) {
        const user = await this.userRepo.findOne({ where: { name: userName } });
        if (!user) {
            throw new Error('Child not found');
        }

        const level = await this.levelRepo.findOne({ 
            where: { levelNumber }, 
            relations: ['words'] 
        });
        if (!level) {
            throw new Error('Level not found');
        }

        // Verificar que el nivel tenga exactamente 5 palabras
        if (level.words.length !== 5) {
            throw new Error(`Level ${levelNumber} must have exactly 5 words`);
        }

        // Crear nueva sesión de juego
        const gameSession = this.gameRepo.create({
            user,
            level,
            wordsAttempted: level.words.map(word => ({
                wordId: word.id,
                wordText: word.text,
                userAnswer: '',
                isCorrect: false,
                attempts: 0
            })),
            finalScore: 0,
            isCompleted: false
        });

        const savedSession = await this.gameRepo.save(gameSession);        const levelFocus = this.getLevelTherapeuticFocus(levelNumber);
        const levelInstruction = this.getLevelInstruction(levelNumber);

        return {
            sessionId: savedSession.id,
            level: {
                levelNumber: level.levelNumber,
                description: level.description,
                therapeuticFocus: levelFocus,
                instruction: levelInstruction
            },
            words: level.words.map(word => ({
                id: word.id,
                text: word.text
            })),
            totalWords: level.words.length
        };
    }    

    async checkAnswer(sessionId: number, wordId: number, userAnswer: string) {
        const session = await this.gameRepo.findOne({
            where: { id: sessionId },
            relations: ['user', 'level']
        });

        if (!session) {
            throw new Error('Game session not found');
        }

        if (session.isCompleted) {
            throw new Error('Game session already completed');
        }

        const wordIndex = session.wordsAttempted.findIndex(w => w.wordId === wordId);
        if (wordIndex === -1) {
            throw new Error('Word not found in this session');
        }

        const wordData = session.wordsAttempted[wordIndex];
        
        if (wordData.isCorrect) {
            return {
                message: 'Word already correct',
                isCorrect: true,
                correctWord: wordData.wordText,
                attempts: wordData.attempts
            };
        }

        wordData.attempts += 1;
        const cleanAnswer = userAnswer.trim().toLowerCase();
        const correctWord = wordData.wordText.toLowerCase();
        wordData.userAnswer = cleanAnswer;
        wordData.isCorrect = cleanAnswer === correctWord;        
        let specificFeedback = '';
        let errorType = '';
        let levelFocus = this.getLevelTherapeuticFocus(session.level.levelNumber);

        if (!wordData.isCorrect) {
            specificFeedback = this.getLevelSpecificFeedback(
                session.level.levelNumber, 
                cleanAnswer, 
                correctWord
            );
            
            const analysis = this.analyzeOrthographicError(cleanAnswer, correctWord);
            errorType = analysis.errorType;
        }

        await this.gameRepo.save(session);

        return {
            isCorrect: wordData.isCorrect,
            correctWord: wordData.wordText,
            attempts: wordData.attempts,
            userAnswer: cleanAnswer,
            message: wordData.isCorrect ? 
                `¡Excelente! Completaste una palabra del nivel ${session.level.levelNumber}.` : 
                specificFeedback,
            errorType: errorType,
            levelFocus: levelFocus,
            hint: wordData.isCorrect ? null : this.getLevelSpecificHint(session.level.levelNumber, correctWord, cleanAnswer)
        };
    }

    private analyzeOrthographicError(userAnswer: string, correctWord: string): { feedback: string; errorType: string } {
        if (this.hasBVError(userAnswer, correctWord)) {
            return {
                feedback: 'Recuerda: La B se usa antes de consonante (ej: blanco) y la V después de N (ej: enviar).',
                errorType: 'confusion_b_v'
            };
        }

        if (this.hasCSZError(userAnswer, correctWord)) {
            return {
                feedback: 'Atención a los sonidos: C (antes de a,o,u), S (sonido suave), Z (antes de a,o,u).',
                errorType: 'confusion_c_s_z'
            };
        }

        if (this.hasAccentError(userAnswer, correctWord)) {
            return {
                feedback: 'Recuerda las reglas de acentuación. Todas las palabras tienen sílaba tónica.',
                errorType: 'accent_error'
            };
        }

        if (userAnswer.length < correctWord.length) {
            return {
                feedback: 'Te falta una letra. Lee despacio y pronuncia cada sílaba.',
                errorType: 'letter_omission'
            };
        }

        if (userAnswer.length > correctWord.length) {
            return {
                feedback: 'Has agregado una letra de más. Revisa letra por letra.',
                errorType: 'letter_addition'
            };
        }

        if (this.hasLetterInversion(userAnswer, correctWord)) {
            return {
                feedback: 'Has cambiado el orden de algunas letras. Ve despacio.',
                errorType: 'letter_inversion'
            };
        }

        return {
            feedback: 'No coincide con la palabra correcta. Inténtalo de nuevo.',
            errorType: 'other_error'
        };
    }

    private hasBVError(userAnswer: string, correctWord: string): boolean {
        return (userAnswer.replace(/b/g, 'v') === correctWord || 
                userAnswer.replace(/v/g, 'b') === correctWord);
    }

    private hasCSZError(userAnswer: string, correctWord: string): boolean {
        const userNormalized = userAnswer.replace(/[csz]/g, '*');
        const correctNormalized = correctWord.replace(/[csz]/g, '*');
        return userNormalized === correctNormalized;
    }

    private hasAccentError(userAnswer: string, correctWord: string): boolean {
        const removeAccents = (str: string) => 
            str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return removeAccents(userAnswer) === removeAccents(correctWord);
    }

    private hasLetterInversion(userAnswer: string, correctWord: string): boolean {
        if (userAnswer.length !== correctWord.length) return false;
        
        const userLetters = userAnswer.split('').sort();
        const correctLetters = correctWord.split('').sort();
        return userLetters.join('') === correctLetters.join('');
    }    
    
    private getLevelSpecificHint(levelNumber: number, correctWord: string, userAnswer: string): string {
        const focus = this.getLevelTherapeuticFocus(levelNumber);
        
        switch (focus) {
            case 'b_v_confusion':
                if (correctWord.includes('b')) {
                    return `Nivel ${levelNumber} - Pista B: Se escribe con B (antes de consonante o después de M).`;
                } else if (correctWord.includes('v')) {
                    return `Nivel ${levelNumber} - Pista V: Se escribe con V (después de N o terminaciones -ava, -ave).`;
                }
                break;
                
            case 'c_s_z_confusion':
                if (correctWord.includes('c')) {
                    return `Nivel ${levelNumber} - Pista C: Sonido fuerte antes de A, O, U.`;
                } else if (correctWord.includes('s')) {
                    return `Nivel ${levelNumber} - Pista S: Sonido suave.`;
                } else if (correctWord.includes('z')) {
                    return `Nivel ${levelNumber} - Pista Z: Sonido fuerte antes de A, O, U.`;
                }
                break;
                
            case 'accent_practice':
                return `Nivel ${levelNumber} - Pista de acentos: Pronuncia fuerte la sílaba tónica y coloca la tilde.`;
                
            case 'letter_omission':
                return `Nivel ${levelNumber} - Pista: Te falta una letra. Pronuncia despacio cada sílaba.`;
                
            case 'letter_inversion':
                return `Nivel ${levelNumber} - Pista: Revisa el orden de las letras, ve despacio.`;
                
            case 'syllable_practice':
                return `Nivel ${levelNumber} - Pista silábica: ${this.divideBySyllables(correctWord)}`;
                
            default:
                return `Nivel ${levelNumber} - Pista: Divide en sílabas: ${this.divideBySyllables(correctWord)}`;
        }
        
        return `Nivel ${levelNumber} - Revisa letra por letra: ${this.divideBySyllables(correctWord)}`;
    }

    // Dividir palabra en sílabas (simplificado)
    private divideBySyllables(word: string): string {
        // Implementación básica para ayuda visual
        return word.split('').join(' - ');
    }

    // Finalizar el juego y calcular puntaje
    async finishGame(sessionId: number) {
        const session = await this.gameRepo.findOne({
            where: { id: sessionId },
            relations: ['user', 'level']
        });

        if (!session) {
            throw new Error('Game session not found');
        }

        if (session.isCompleted) {
            throw new Error('Game session already completed');
        }

        // Calcular puntaje basado en palabras correctas y intentos
        let totalScore = 0;
        let correctWords = 0;

        session.wordsAttempted.forEach(word => {
            if (word.isCorrect) {
                correctWords++;
                // Puntaje base de 20 puntos por palabra correcta
                let wordScore = 20;
                
                // Bonus por pocos intentos: 10 puntos extra si lo hace en el primer intento
                if (word.attempts === 1) {
                    wordScore += 10;
                } else if (word.attempts === 2) {
                    wordScore += 5;
                }
                
                totalScore += wordScore;
            }
        });

        // Bonus por completar todas las palabras
        if (correctWords === 5) {
            totalScore += 50; // Bonus de 50 puntos por completar todo
        }

        // Actualizar sesión
        session.finalScore = totalScore;
        session.isCompleted = true;
        await this.gameRepo.save(session);        // Determinar si pasó el nivel (necesita al menos 3 palabras correctas)
        const levelPassed = correctWords >= 3;

        if (levelPassed) {
            await this.progressService.saveProgress(
                session.user.name,
                session.level.levelNumber,
                totalScore,
                correctWords === 5
            );

            // Dar puntos al usuario por completar el nivel
            const pointsEarned = Math.floor(totalScore * 0.5); // 50% del puntaje como puntos de cosmético
            session.user.totalPoints += pointsEarned;
            session.user.availablePoints += pointsEarned;
            await this.userRepo.save(session.user);
        }        const pointsEarned = levelPassed ? Math.floor(totalScore * 0.5) : 0;

        return {
            sessionId: session.id,
            finalScore: totalScore,
            correctWords,
            totalWords: 5,
            levelPassed,
            levelCompleted: correctWords === 5,
            pointsEarned,
            totalPoints: session.user.totalPoints,
            availablePoints: session.user.availablePoints,
            wordsResult: session.wordsAttempted.map(word => ({
                word: word.wordText,
                userAnswer: word.userAnswer,
                isCorrect: word.isCorrect,
                attempts: word.attempts
            }))
        };
    }

    async getGameStatus(sessionId: number) {
        const session = await this.gameRepo.findOne({
            where: { id: sessionId },
            relations: ['level']
        });

        if (!session) {
            throw new Error('Game session not found');
        }

        const correctWords = session.wordsAttempted.filter(w => w.isCorrect).length;

        return {
            sessionId: session.id,
            level: session.level.levelNumber,
            isCompleted: session.isCompleted,
            correctWords,
            totalWords: session.wordsAttempted.length,
            currentScore: session.finalScore,
            wordsStatus: session.wordsAttempted.map(word => ({
                wordId: word.wordId,
                word: word.wordText,
                isCorrect: word.isCorrect,
                attempts: word.attempts,
                canTryAgain: !word.isCorrect && word.attempts < 3 
            }))
        };
    }

    // Obtener historial de juegos de un niño
    async getChildGameHistory(userName: string) {
        const user = await this.userRepo.findOne({ where: { name: userName } });
        if (!user) {
            throw new Error('Child not found');
        }

        const sessions = await this.gameRepo.find({
            where: { user: { id: user.id }, isCompleted: true },
            relations: ['level'],
            order: { playedAt: 'DESC' }
        });

        return sessions.map(session => ({
            sessionId: session.id,
            level: session.level.levelNumber,
            score: session.finalScore,
            correctWords: session.wordsAttempted.filter(w => w.isCorrect).length,
            totalWords: session.wordsAttempted.length,
            playedAt: session.playedAt
        }));
    }
    
    
    private getLevelTherapeuticFocus(levelNumber: number): string {
        const levelFocus = {
            1: 'basic_writing',      // Escritura básica - palabras simples
            2: 'b_v_confusion',      // Confusión B/V
            3: 'c_s_z_confusion',    // Confusión C/S/Z
            4: 'accent_practice',    // Práctica de acentos
            5: 'letter_omission',    // Omisión de letras
            6: 'letter_inversion',   // Inversión de letras
            7: 'syllable_practice',  // Práctica silábica
            8: 'complex_words',      // Palabras complejas
            9: 'mixed_practice',     // Práctica mixta
            10: 'advanced_writing'   // Escritura avanzada
        };
        
        return levelFocus[levelNumber] || 'basic_writing';
    }

    private getLevelSpecificFeedback(levelNumber: number, userAnswer: string, correctWord: string): string {
        const focus = this.getLevelTherapeuticFocus(levelNumber);
        
        switch (focus) {
            case 'b_v_confusion':
                if (this.hasBVError(userAnswer, correctWord)) {
                    return 'Este nivel practica B/V. Recuerda: B antes de consonante, V después de N.';
                }
                break;
            case 'c_s_z_confusion':
                if (this.hasCSZError(userAnswer, correctWord)) {
                    return 'Este nivel practica C/S/Z. Escucha bien: ¿sonido suave o fuerte?';
                }
                break;
            case 'accent_practice':
                if (this.hasAccentError(userAnswer, correctWord)) {
                    return 'Este nivel practica acentos. Pronuncia fuerte la sílaba tónica.';
                }
                break;
            case 'letter_omission':
                if (userAnswer.length < correctWord.length) {
                    return 'Este nivel practica completar letras. Lee despacio, sílaba por sílaba.';
                }
                break;
            case 'letter_inversion':
                if (this.hasLetterInversion(userAnswer, correctWord)) {
                    return 'Este nivel practica el orden correcto. Ve despacio, letra por letra.';
                }
                break;
            case 'syllable_practice':
                return 'Este nivel practica separación silábica. Divide la palabra paso a paso.';
            default:
                return 'Revisa la escritura. Cada nivel te ayuda con una dificultad específica.';
        }
        
        const analysis = this.analyzeOrthographicError(userAnswer, correctWord);
        return analysis.feedback;
    }

    private removeAccents(str: string): string {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    private getLevelInstruction(levelNumber: number): string {
        const instructions = {
            1: 'Nivel 1: Escritura básica - Escribe palabras simples correctamente.',
            2: 'Nivel 2: Practica B y V - Presta atención al sonido y las reglas.',
            3: 'Nivel 3: Practica C, S y Z - Escucha bien si el sonido es suave o fuerte.',
            4: 'Nivel 4: Practica acentos - Encuentra la sílaba tónica y coloca tildes.',
            5: 'Nivel 5: Letras completas - Asegúrate de no omitir ninguna letra.',
            6: 'Nivel 6: Orden correcto - Revisa que las letras estén en su lugar.',
            7: 'Nivel 7: Separación silábica - Divide las palabras correctamente.',
            8: 'Nivel 8: Palabras complejas - Combina todo lo aprendido.',
            9: 'Nivel 9: Práctica mixta - Demuestra todo tu conocimiento.',
            10: 'Nivel 10: Maestro de la escritura - ¡Eres un experto!'
        };
        
        return instructions[levelNumber] || 'Escribe las palabras correctamente.';
    }
}
