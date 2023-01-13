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

 const updateDelayDays = async(accountId)=>{
    const account = await stripe.accounts.update(accountId,{
        settings:{
            payouts:{
                schedule:{
                    delay_days:7
                }
            }
        }
    })
    return account;

}

export const getAccountStatus = async (req,res) =>{
    const user = User.findById(req.user._id).exec();
    const account = await stripe.account.retrieve(user.stripe_account_id)
    const updatedAccount = await updateDelayDays(account.id)
    const updatedUser = await User.findByIdAndUpdate(user._id,{
        stripe_seller: updatedAccount
    },{new:true}).select('-password').exec()
    res.json(updatedUser);
}

export const getAccountBalance = async (req,res)=>{
    const user = User.findById(req.user._id).exec();
    try {
        const balance = await stripe.balance.retrieve({
            stripeAccount: user.stripe_account_id
        })
        res.json(balance)
    } catch (err) {
        console.log(err)
    }
}

export const payoutSetting = async(req,res)=>{
    try {
        const user = User.findById(req.user._id).exec();
        const logInLink = await stripe.account.createLoginLink(user.stripe_seller.id,{
            redirect_url: process.env.STRIPE_SETTING_REDIRECT_URL
        })
        res.json(logInLink)
    } catch (err) {
        console.log(err)
    }
}