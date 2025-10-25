import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
    node_env: process.env.NODE_ENV,
    port: process.env.PORT,
    database_url: process.env.DATABASE_URL,
    cloudinary: {
        api_secret: process.env.CLOUDINARY_API_SECRET,
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
    },
    openRouterApiKey: process.env.OPENROUTER_API_KEY,
    stripeSecretKey:process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret:process.env.STRIPE_WEBHOOK_SECRET,

    jwt: {
        jwt_secret: process.env.JWT_SECRET,
        expires_in: process.env.JWT_EXPIRES_IN,
        refresh_token_secret: process.env.REFRESH_TOKEN_SECRET,
        refresh_token_expires_in: process.env.REFRESH_TOKEN_EXPIRES_IN,
        reset_pass_secret: process.env.RESET_PASS_SECRET,
        reset_pass_token_expires_in: process.env.RESET_PASS_TOKEN_EXPIRES_IN,
    },
    emailSender:{
        email:process.env.SMTP_USER,
        app_pass:process.env.SMTP_PASS,
    },
    reset_pass_link: process.env.RESET_PASS_LINK,
    salt_round: process.env.SALT_ROUND

}