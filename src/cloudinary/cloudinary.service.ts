import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { promises } from 'dns';

@Injectable()
export class CloudinaryService {
    constructor(){
        cloudinary.config({
            cloud_name: process.env.Cloud_Name,
            api_key: process.env.Cloud_api_key,
            api_secret: process.env.Cloud_api_secret_key,
        })
    }

    async uploadImage(filePath: string): Promise<string> {
        try {
            const result = await cloudinary.uploader.upload(filePath, {
                folder: 'images', 
                use_filename: true,
            });

            return result.secure_url;

        } catch (error) {
            console.error('Error uploading image to Cloudinary:', error);
            throw error;
        } 
    }
}
