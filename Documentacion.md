# DOCUMENTACIÓN DE LETRISMO

##  Resumen
API REST para el juego terapéutico de ortografía **Letrismo**, desarrollada en **NestJS** con **PostgreSQL**. 

Sistema educativo diseñado para niños con **disortografía** que incluye:
-  10 niveles progresivos con enfoque terapéutico específico
-  Sistema de puntuación basado en precisión y eficiencia
-  Tienda de cosméticos (outfits) como recompensa
-  Seguimiento detallado del progreso del niño
-  Retroalimentación pedagógica específica por tipo de error

**URL base (desarrollo):** `http://localhost:3000`  
**Content-Type:** `application/json`

---

## Tabla de Contenidos
- [Usuarios](#usuarios)
- [Palabras](#palabras)
- [Niveles](#niveles)
- [Progreso](#progreso)
- [Juego](#juego)
- [Cosméticos](#cosméticos)
- [Sistema de Puntajes](#sistema-de-puntajes)
- [Niveles Terapéuticos](#niveles-terapéuticos)
- [Flujo Completo](#flujo-completo-del-juego)

---

### Usuarios

#### POST `/user/create`
Crear o recuperar un usuario.

**Body:**
```json
{
  "name": "sofia"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "sofia",
  "totalPoints": 0,
  "availablePoints": 0
}
```

#### GET `/user/all`
Obtiene todos los usuarios registrados en la aplicación.

**Response:**
```json
[
  {
    "id": 1,
    "name": "sofia",
    "totalPoints": 150,
    "availablePoints": 75
  },
  {
    "id": 2,
    "name": "juan",
    "totalPoints": 300,
    "availablePoints": 150
  }
]
```

#### GET `/user/find/:name`
Busca un usuario específico por su nombre.

**Ejemplo:** `/user/find/sofia`

**Response:**
```json
{
  "id": 1,
  "name": "sofia",
  "totalPoints": 150,
  "availablePoints": 75
}
```

#### DELETE `/user/remove/:id`
Elimina un usuario de la base de datos.

**Ejemplo:** `/user/remove/1`

**Response:**
```json
{
  "message": "User removed successfully"
}
```

---

## Palabras

#### POST `/words/create`
Crear una palabra asociada a un nivel **subiendo una imagen de ejemplo**.

**IMPORTANTE:** Este endpoint usa `multipart/form-data` para subir archivos.

**Requisitos:**
- Formato de imagen: JPG, JPEG, PNG, GIF, WEBP
- Tamaño máximo: 5MB
- La imagen se guarda en: `public/images/words/`

**En Postman:**
1. Método: `POST`
2. URL: `http://localhost:3000/words/create`
3. Body: Seleccionar **form-data**
4. Agregar campos:

| KEY | TYPE | VALUE |
|-----|------|-------|
| `image` | **File** | [Seleccionar archivo] |
| `text` | Text | `"vaca"` |
| `levelId` | Text | `1` |

**Response:**
```json
{
  "message": "Word created successfully",
  "data": {
    "id": 1,
    "text": "vaca",
    "imageUrl": "/images/words/image-1731398472839-234567890.png",
    "level": {
      "id": 1,
      "levelNumber": 1
    }
  }
}
```

**Ejemplo con cURL:**
```bash
curl -X POST http://localhost:3000/words/create \
  -F "image=@/ruta/a/imagen.png" \
  -F "text=vaca" \
  -F "levelId=1"
```

**Ejemplo con Flutter:**
```dart
var request = http.MultipartRequest(
  'POST', 
  Uri.parse('http://localhost:3000/words/create')
);

request.files.add(
  await http.MultipartFile.fromPath('image', imageFile.path)
);

request.fields['text'] = 'vaca';
request.fields['levelId'] = '1';

var response = await request.send();
```

#### GET `/words/all`
Obtiene todas las palabras con sus niveles asociados.

**Response:**
```json
[
  {
    "id": 1,
    "text": "vaca",
    "level": {
      "id": 1,
      "levelNumber": 1,
      "description": "Escritura básica"
    }
  }
]
```

#### GET `/words/find/:text`
Busca una palabra específica por su texto.

**Ejemplo:** `/words/find/vaca`

**Response:**
```json
{
  "message": "Word retrieved successfully",
  "data": {
    "id": 1,
    "text": "vaca",
    "level": {
      "id": 1,
      "levelNumber": 1
    }
  }
}
```

#### PATCH `/words/edit/:id`
Edita el texto de una palabra existente.

**Ejemplo:** `/words/edit/1`

**Body:**
```json
{
  "newText": "perro"
}
```

**Response:**
```json
{
  "message": "Word updated successfully",
  "data": {
    "id": 1,
    "text": "perro"
  }
}
```

#### DELETE `/words/delete/:id`
Elimina una palabra de la base de datos.

**Ejemplo:** `/words/delete/1`

**Response:**
```json
{
  "message": "Word removed successfully"
}
```

---

##  Niveles

#### POST `/levels`
Crear un nuevo nivel.

**Body:**
```json
{
  "levelNumber": 1,
  "description": "Escritura básica"
}
```

**Response:**
```json
{
  "id": 1,
  "levelNumber": 1,
  "description": "Escritura básica"
}
```

#### GET `/levels`
Listar todos los niveles con sus palabras y progreso asociado.

**Response:**
```json
[
  {
    "id": 1,
    "levelNumber": 1,
    "description": "Escritura básica",
    "words": [
      { 
        "id": 1, 
        "text": "casa", 
        "imageUrl": "/images/words/image-1731398472839-234567890.png"
      },
      { 
        "id": 2, 
        "text": "mesa",
        "imageUrl": "/images/words/image-1731398472839-234567890.png"
      },
      { 
        "id": 3, 
        "text": "perro", 
        "imageUrl": "/images/words/image-1731398472839-234567890.png"
      },
      { 
        "id": 4, 
        "text": "gato",
        "imageUrl": "/images/words/image-1731398472839-234567890.png"
      },
      { 
        "id": 5,
         "text": "sol", 
         "imageUrl": "/images/words/image-1731398472839-234567890.png"
      }
    ],
    "progress": []
  }
]
```

#### GET `/levels/:levelNumber`
Obtener un nivel específico con sus palabras.

**Ejemplo:** `/levels/1`

**Response:**
```json
{
  "id": 1,
  "levelNumber": 1,
  "description": "Escritura básica",
  "words": [
    { 
      "id": 1, 
      "text": "casa", 
      "imageUrl": "/images/words/image-1731398472839-234567890.png" 
    }
  ]
}
```

#### PUT `/levels/:id`
Editar la descripción de un nivel.

**Ejemplo:** `/levels/1`

**Body:**
```json
{
  "description": "Escritura básica mejorada"
}
```

**Response:**
```json
{
  "id": 1,
  "levelNumber": 1,
  "description": "Escritura básica mejorada"
}
```

#### DELETE `/levels/:id`
Eliminar un nivel de la base de datos.

**Ejemplo:** `/levels/1`

**Response:**
```json
{
  "message": "Level removed successfully"
}
```

---

##  Progreso

#### POST `/progress/save`
Guardar o actualizar el progreso de un usuario en un nivel.

**Body:**
```json
{
  "userName": "sofia",
  "levelNumber": 1,
  "score": 150,
  "isComplete": true
}
```

**Response:**
```json
{
  "id": 1,
  "user": {
    "id": 1,
    "name": "sofia"
  },
  "level": {
    "id": 1,
    "levelNumber": 1
  },
  "score": 150,
  "complete": true
}
```

#### GET `/progress/child/:userName`
Obtener el progreso completo de un niño en todos los niveles.

**Ejemplo:** `/progress/child/sofia`

**Response:**
```json
[
  {
    "id": 1,
    "score": 150,
    "complete": true,
    "level": {
      "id": 1,
      "levelNumber": 1,
      "description": "Escritura básica"
    }
  },
  {
    "id": 2,
    "score": 0,
    "complete": false,
    "level": {
      "id": 2,
      "levelNumber": 2,
      "description": "Confusión B/V"
    }
  }
]
```

#### GET `/progress/completed/:userName/:levelNumber`
Verificar si un nivel específico fue completado por el usuario.

**Ejemplo:** `/progress/completed/sofia/1`

**Response:**
```json
{
  "userName": "sofia",
  "levelNumber": 1,
  "completed": true
}
```

#### GET `/progress/next-level/:userName`
Obtener el siguiente nivel disponible para el usuario.

**Ejemplo:** `/progress/next-level/sofia`

**Response:**
```json
{
  "id": 2,
  "levelNumber": 2,
  "description": "Confusión B/V",
  "words": [...]
}
```

#### GET `/progress/stats/:userName`
Obtener las estadísticas generales del usuario.

**Ejemplo:** `/progress/stats/sofia`

**Response:**
```json
{
  "childName": "sofia",
  "totalLevels": 10,
  "completedLevels": 3,
  "totalScore": 450,
  "progressPercentage": 30
}
```

---

##  Juego

#### POST `/game/start`
Iniciar una nueva sesión de juego para un nivel específico.

**Body:**
```json
{
  "userName": "sofia",
  "levelNumber": 2
}
```

**Response:**
```json
{
  "sessionId": 123,
  "level": {
    "levelNumber": 2,
    "description": "Confusión B/V",
    "therapeuticFocus": "b_v_confusion",
    "instruction": "Nivel 2: Practica B y V - Presta atención al sonido y las reglas."
  },
  "words": [
    { "id": 6, "text": "caballo" },
    { "id": 7, "text": "vaca" },
    { "id": 8, "text": "debate" },
    { "id": 9, "text": "vivir" },
    { "id": 10, "text": "cabeza" }
  ],
  "totalWords": 5
}
```

#### POST `/game/check-answer`
Verificar la respuesta del usuario para una palabra específica.

**Body:**
```json
{
  "sessionId": 123,
  "wordId": 6,
  "userAnswer": "caballo"
}
```

**Response (Respuesta Correcta):**
```json
{
  "isCorrect": true,
  "correctWord": "caballo",
  "attempts": 1,
  "userAnswer": "caballo",
  "message": "¡Excelente! Completaste una palabra del nivel 2.",
  "errorType": "",
  "levelFocus": "b_v_confusion",
  "hint": null
}
```

**Response (Respuesta Incorrecta):**
```json
{
  "isCorrect": false,
  "correctWord": "vaca",
  "attempts": 1,
  "userAnswer": "baca",
  "message": "Este nivel practica B/V. Recuerda: B antes de consonante, V después de N.",
  "errorType": "confusion_b_v",
  "levelFocus": "b_v_confusion",
  "hint": "Nivel 2 - Pista V: Se escribe con V (después de N o terminaciones -ava, -ave)."
}
```

#### GET `/game/status/:sessionId`
Obtener el estado actual de una sesión de juego.

**Ejemplo:** `/game/status/123`

**Response:**
```json
{
  "sessionId": 123,
  "level": 2,
  "isCompleted": false,
  "correctWords": 2,
  "totalWords": 5,
  "currentScore": 0,
  "wordsStatus": [
    {
      "wordId": 6,
      "word": "caballo",
      "isCorrect": true,
      "attempts": 1,
      "canTryAgain": false
    },
    {
      "wordId": 7,
      "word": "vaca",
      "isCorrect": false,
      "attempts": 2,
      "canTryAgain": true
    }
  ]
}
```

#### POST `/game/finish/:sessionId`
Finalizar una sesión de juego y calcular el puntaje final.

**Ejemplo:** `/game/finish/123`

**Response:**
```json
{
  "sessionId": 123,
  "finalScore": 165,
  "correctWords": 4,
  "totalWords": 5,
  "levelPassed": true,
  "levelCompleted": false,
  "pointsEarned": 82,
  "totalPoints": 165,
  "availablePoints": 82,
  "wordsResult": [
    {
      "word": "caballo",
      "userAnswer": "caballo",
      "isCorrect": true,
      "attempts": 1
    },
    {
      "word": "vaca",
      "userAnswer": "vaca",
      "isCorrect": true,
      "attempts": 2
    },
    {
      "word": "debate",
      "userAnswer": "devate",
      "isCorrect": false,
      "attempts": 3
    },
    {
      "word": "vivir",
      "userAnswer": "vivir",
      "isCorrect": true,
      "attempts": 1
    },
    {
      "word": "cabeza",
      "userAnswer": "cabeza",
      "isCorrect": true,
      "attempts": 1
    }
  ]
}
```

#### GET `/game/history/:userName`
Obtener el historial completo de sesiones de juego del usuario.

**Ejemplo:** `/game/history/sofia`

**Response:**
```json
[
  {
    "sessionId": 123,
    "level": 2,
    "score": 165,
    "correctWords": 4,
    "totalWords": 5,
    "playedAt": "2025-01-11T10:30:00.000Z"
  },
  {
    "sessionId": 122,
    "level": 1,
    "score": 200,
    "correctWords": 5,
    "totalWords": 5,
    "playedAt": "2025-01-10T15:20:00.000Z"
  }
]
```

---

## Cosméticos

#### POST `/cosmetics/create`
Crear un nuevo cosmético (outfit) **subiendo una imagen**.


**Requisitos:**
- Formato de imagen: JPG, JPEG, PNG, GIF, WEBP
- Tamaño máximo: 5MB
- La imagen se guarda en: `public/images/outfits/`

**En Postman:**
1. Método: `POST`
2. URL: `http://localhost:3000/cosmetics/create`
3. Body: Seleccionar **form-data**
4. Agregar campos:

| KEY | TYPE | VALUE |
|-----|------|-------|
| `image` | **File** | [Seleccionar archivo] |
| `name` | Text | `"Outfit Pirata"` |
| `description` | Text | `"Traje de pirata"` |
| `cost` | Text | `200` |

**Response:**
```json
{
  "id": 7,
  "name": "Outfit Pirata",
  "description": "Traje de pirata",
  "cost": 200,
  "imageUrl": "/images/kjhl",
  "isActive": true
}
```

**Nota:** El nombre del archivo se genera automáticamente con timestamp para evitar duplicados.

**Ejemplo con cURL:**
```bash
curl -X POST http://localhost:3000/cosmetics/create \
  -F "image=@/ruta/a/imagen.png" \
  -F "name=Outfit Pirata" \
  -F "description=Traje de pirata" \
  -F "cost=200"
```

**Ejemplo con Flutter:**
```dart
var request = http.MultipartRequest(
  'POST', 
  Uri.parse('http://localhost:3000/cosmetics/create')
);

request.files.add(
  await http.MultipartFile.fromPath('image', imageFile.path)
);

request.fields['name'] = 'Outfit Pirata';
request.fields['description'] = 'Traje de pirata';
request.fields['cost'] = '200';

var response = await request.send();
```

#### POST `/cosmetics/create-samples`
Crear cosméticos de ejemplo predefinidos (6 outfits).

**Response:**
```json
{
  "message": "Created 6 sample outfits",
  "outfits": [
    { "id": 1, "name": "Outfit Básico", "cost": 0 },
    { "id": 2, "name": "Outfit Casual", "cost": 100 },
    { "id": 3, "name": "Traje de Superhéroe", "cost": 200 },
    { "id": 4, "name": "Traje de Astronauta", "cost": 300 },
    { "id": 5, "name": "Vestido de Princesa", "cost": 250 },
    { "id": 6, "name": "Conjunto Deportivo", "cost": 150 }
  ]
}
```

#### GET `/cosmetics/shop/:userName`
Obtener la tienda de cosméticos con información de disponibilidad para el usuario.

**Ejemplo:** `/cosmetics/shop/sofia`

**Response:**
```json
[
  {
    "id": 1,
    "name": "Outfit Básico",
    "description": "El conjunto por defecto para todos los niños",
    "cost": 0,
    "imageUrl": "http://localhost:3000/images/outfits/default.png",
    "owned": true,
    "canAfford": true
  },
  {
    "id": 2,
    "name": "Outfit Casual",
    "description": "Ropa cómoda para el día a día",
    "cost": 100,
    "imageUrl": "http://localhost:3000/images/outfits/casual.png",
    "owned": false,
    "canAfford": false
  }
]
```

#### POST `/cosmetics/buy`
Comprar un cosmético con los puntos disponibles del usuario.

**Body:**
```json
{
  "userName": "sofia",
  "cosmeticId": 2
}
```

**Response:**
```json
{
  "message": "¡Compraste Outfit Casual por 100 puntos!",
  "remainingPoints": 50,
  "outfit": "Outfit Casual"
}
```

#### POST `/cosmetics/equip`
Equipar un cosmético que el usuario ya posee (solo uno a la vez).

**Body:**
```json
{
  "userName": "sofia",
  "cosmeticId": 2
}
```

**Response:**
```json
{
  "message": "¡Ahora llevas puesto Outfit Casual!",
  "equippedOutfit": "Outfit Casual"
}
```

#### GET `/cosmetics/profile/:userName`
Obtener el perfil del usuario con su outfit equipado y puntos.

**Ejemplo:** `/cosmetics/profile/sofia`

**Response:**
```json
{
  "name": "sofia",
  "totalPoints": 165,
  "availablePoints": 50,
  "totalOutfits": 3,
  "currentOutfit": {
    "name": "Outfit Casual",
    "imageUrl": "http://localhost:3000/images/outfits/casual.png"
  }
}
```

#### GET `/cosmetics/inventory/:userName`
Obtener el inventario completo de cosméticos del usuario.

**Ejemplo:** `/cosmetics/inventory/sofia`

**Response:**
```json
[
  {
    "id": 1,
    "name": "Outfit Básico",
    "description": "El conjunto por defecto para todos los niños",
    "imageUrl": "http://localhost:3000/images/outfits/default.png",
    "isEquipped": false,
    "purchaseDate": "2025-01-10T12:00:00.000Z"
  },
  {
    "id": 2,
    "name": "Outfit Casual",
    "description": "Ropa cómoda para el día a día",
    "imageUrl": "http://localhost:3000/images/outfits/casual.png",
    "isEquipped": true,
    "purchaseDate": "2025-01-11T15:30:00.000Z"
  }
]
```

---

## Sistema de Puntajes

### Cálculo de Puntos por Palabra
Cada palabra correcta otorga puntos según la eficiencia del niño:

- **20 puntos base** por palabra correcta
- **+10 puntos bonus** si la escribe correctamente en el **primer intento**
- **+5 puntos bonus** si la escribe correctamente en el **segundo intento**
- **0 puntos bonus** si tarda **3 intentos o más**

### Bonus de Completitud
- **+50 puntos extra** si completa las **5 palabras correctamente**

### Ejemplo de Puntaje Máximo
```
Palabra 1: 20 + 10 = 30 puntos (1er intento)
Palabra 2: 20 + 10 = 30 puntos (1er intento)
Palabra 3: 20 + 10 = 30 puntos (1er intento)
Palabra 4: 20 + 10 = 30 puntos (1er intento)
Palabra 5: 20 + 10 = 30 puntos (1er intento)
Bonus completitud: +50 puntos
----------------------------------------
Total: 200 puntos
```

### Ejemplo de Puntaje Promedio
```
Palabra 1: 20 + 5 = 25 puntos (2do intento)
Palabra 2: 20 + 10 = 30 puntos (1er intento)
Palabra 3: 0 puntos (incorrecta)
Palabra 4: 20 + 0 = 20 puntos (3er intento)
Palabra 5: 20 + 10 = 30 puntos (1er intento)
Bonus completitud: 0 (no completó las 5)
----------------------------------------
Total: 105 puntos
```

### Conversión a Puntos de Tienda
Los puntos del juego se convierten en puntos para gastar en la tienda:

**Fórmula:** `pointsEarned = Math.floor(finalScore * 0.5)`

**Ejemplos:**
- 200 puntos de juego → **100 puntos para la tienda**
- 165 puntos de juego → **82 puntos para la tienda**
- 105 puntos de juego → **52 puntos para la tienda**

### Actualización de Puntos del Usuario
Cuando se finaliza un nivel, se actualizan dos campos:

- **`totalPoints`**: Puntos totales acumulados (histórico, nunca disminuye)
- **`availablePoints`**: Puntos disponibles para gastar (disminuye al comprar)

### Condiciones para Ganar Puntos
-  **Mínimo 3 de 5 palabras correctas** para pasar el nivel y ganar puntos
-  **5 de 5 palabras correctas** para marcar el nivel como "completado"
-  **Menos de 3 correctas** no otorga puntos de tienda

### Precios de Outfits (Ejemplo)
```
- Outfit Básico: 0 puntos (gratis)
- Conjunto Deportivo: 150 puntos
- Outfit Casual: 100 puntos
- Traje de Superhéroe: 200 puntos
- Vestido de Princesa: 250 puntos
- Traje de Astronauta: 300 puntos
```

---

## Niveles Terapéuticos

Cada nivel está diseñado para trabajar una dificultad específica de la disortografía:

### Nivel 1: Escritura Básica
- **Enfoque:** Familiarización con palabras simples
- **Palabras:** Casa, mesa, perro, gato, sol
- **Objetivo:** Establecer confianza y rutina de escritura

### Nivel 2: Confusión B/V
- **Enfoque:** Distinción entre B y V
- **Reglas:**
  - B antes de consonante (ej: blanco, brazo)
  - B después de M (ej: cambio,ombro)
  - V después de N (ej: enviar, invierno)
  - V en terminaciones -ava, -ave, -avo, -eva, -eve, -evo, -iva, -ivo
- **Feedback específico:** "Recuerda: B antes de consonante, V después de N"

### Nivel 3: Confusión C/S/Z
- **Enfoque:** Distinción de sonidos similares (seseo/ceceo)
- **Reglas:**
  - C tiene sonido fuerte antes de A, O, U
  - S tiene sonido suave
  - Z tiene sonido fuerte antes de A, O, U
- **Feedback específico:** "Atención: ¿sonido suave o fuerte?"

### Nivel 4: Práctica de Acentos
- **Enfoque:** Identificar sílaba tónica y colocar tildes
- **Reglas de acentuación:**
  - Agudas: acento en última sílaba (terminan en n, s, vocal)
  - Graves: acento en penúltima sílaba
  - Esdrújulas: acento en antepenúltima (siempre llevan tilde)
- **Feedback específico:** "Pronuncia fuerte la sílaba tónica"

### Nivel 5: Omisión de Letras
- **Enfoque:** Completar todas las letras de la palabra
- **Estrategia:** Pronunciar despacio, sílaba por sílaba
- **Feedback específico:** "Te falta una letra. Lee despacio"

### Nivel 6: Inversión de Letras
- **Enfoque:** Orden correcto de las letras
- **Ejemplo:** "casa" no "acsa"
- **Feedback específico:** "Has cambiado el orden. Ve despacio"

### Nivel 7: Separación Silábica
- **Enfoque:** Estructura correcta de sílabas
- **Ejercicio:** Dividir palabras en sílabas
- **Feedback específico:** División visual de la palabra

### Nivel 8: Palabras Complejas
- **Enfoque:** Combinación de dificultades anteriores
- **Palabras:** Largas o con múltiples reglas ortográficas
- **Objetivo:** Aplicar todo lo aprendido

### Nivel 9: Práctica Mixta
- **Enfoque:** Todos los tipos de errores mezclados
- **Objetivo:** Reforzar aprendizaje integral

### Nivel 10: Maestría de Escritura
- **Enfoque:** Escritura avanzada y compleja
- **Objetivo:** Demostrar dominio completo

---

## Flujo Completo del Juego

###  Registro/Login
```http
POST /user/create
Body: { "name": "sofia" }
```
**Resultado:** Usuario creado o recuperado con puntos iniciales

---

###  Ver Progreso
```http
GET /progress/stats/sofia
GET /progress/next-level/sofia
```
**Resultado:** Ver niveles completados y siguiente nivel disponible

---

###  Iniciar Nivel
```http
POST /game/start
Body: { "userName": "sofia", "levelNumber": 2 }
```
**Resultado:** Sesión de juego creada con 5 palabras

---

###  Jugar (5 Palabras)
```http
POST /game/check-answer
Body: { "sessionId": 123, "wordId": 6, "userAnswer": "caballo" }
```
**Resultado:** Feedback inmediato (correcto/incorrecto + pista pedagógica)

**Repetir para cada palabra (máximo 3 intentos por palabra)**

---

###  Finalizar Nivel
```http
POST /game/finish/123
```
**Resultado:** 
- Puntaje final calculado
- Puntos para tienda otorgados (50% del score)
- Progreso guardado automáticamente

---

###  Ver Tienda
```http
GET /cosmetics/shop/sofia
```
**Resultado:** Catálogo de outfits con precios y disponibilidad

---

###  Comprar Outfit
```http
POST /cosmetics/buy
Body: { "userName": "sofia", "cosmeticId": 2 }
```
**Resultado:** Outfit comprado, puntos descontados

---

###  Equipar Outfit
```http
POST /cosmetics/equip
Body: { "userName": "sofia", "cosmeticId": 2 }
```
**Resultado:** Outfit equipado en el personaje

---

###  Ver Perfil
```http
GET /cosmetics/profile/sofia
```
**Resultado:** Perfil con avatar personalizado y estadísticas

---

##  Archivos Estáticos

### Configuración
Las imágenes de outfits se sirven desde la carpeta `public/images/` del servidor.

### Estructura de Carpetas
```
public/
  images/
    outfits/
      default.png
      casual.png
      superhero.png
      princess.png
      astronaut.png
      sports.png
```


### Conversión Automática
El backend convierte rutas relativas a URLs completas:
- **Guardado en DB:** `/images/outfits/casual.png`
- **Retornado en API:** `http://localhost:3000/images/outfits/casual.png`

---

## Notas Técnicas

### Tecnologías
- **Backend:** NestJS 11.x
- **Base de Datos:** PostgreSQL
- **ORM:** TypeORM
- **Lenguaje:** TypeScript


### Entidades
- **User:** Información del niño y puntos
- **Level:** Niveles del juego (1-10)
- **Word:** Palabras asociadas a niveles
- **Progress:** Progreso del usuario por nivel
- **GameSession:** Sesiones de juego
- **Cosmetic:** Outfits disponibles
- **UserCosmetic:** Outfits comprados/equipados


### Manejo de Errores
- `Child not found` - Usuario no existe
- `Level not found` - Nivel no existe
- `Word not found` - Palabra no existe
- `Game session not found` - Sesión inválida
- `You already own this outfit` - Cosmético ya comprado
- `You need X more points` - Puntos insuficientes
- `You do not own this outfit` - Cosmético no comprado


