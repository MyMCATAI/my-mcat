import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // TODO convert this to live
    apiVersion:"2023-10-16",
    typescript: true
})