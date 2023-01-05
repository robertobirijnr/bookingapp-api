import express  from "express"
import { register } from "../controllers/auth"

const router = express.Router()

router.get('/:message',(req,res)=>{
    res.status(200).send(req.params.message)
})
router.post('/register',register)

module.exports = router;