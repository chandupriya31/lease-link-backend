import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION,
    signatureVersion: 'v4'
});

export async function uploadToS3(file) {
    const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: `${uuidv4()}-${file.originalname}`,
        Body: file.buffer
    }
    const data = await s3.upload(params).promise();
    return { url: data.Location, key: data.Key };
}

export async function deleteFromS3(key) {
    const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: key
    }

    try {
        await s3.deleteObject(params).promise();
        return true
    } catch (error) {
        return false
    }
}