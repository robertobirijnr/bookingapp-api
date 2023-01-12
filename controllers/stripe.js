import User from "../models/user"
import Stripe from "stripe";
const queryString = require('query-string');

const stripe = Stripe(process.env.STRIPE_SECRETE);

export const createConnectAccount = async(req,res)=>{
    console.log(req.auth._id)
    let user = await User.findById(req.auth._id).exec();

    

    if(!user.stripe_account_id){
        const account = await stripe.account.create({
            type: 'express'
        })

        user.stripe_account_id = account.id;
        user.save();
    }

    let accountLink = await stripe.accountLinks.create({
        account:user.stripe_account_id,
        refresh_url:process.env.STRIPE_REDIRECT_URL,
        return_url:process.env.STRIPE_REDIRECT_URL,
        type: 'account_onboarding'
    })
    

    accountLink = Object.assign(accountLink,{
        "stripe_user[email]": user.email || undefined,
    })

    res.send(`${accountLink.url}?${queryString.stringify(accountLink)}`)
}