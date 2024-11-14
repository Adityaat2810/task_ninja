import express from 'express'
import {PrismaClient} from "@prisma/client"

const client = new PrismaClient();
const app = express();
app.use(express.json())

app.post('/hooks/catch/:userId/:zapId',async (req,res)=>{
    const userId = req.params.userId;
    const zapId = req.params.zapId;
    const body = req.body;


    // store in db a new trigger
    // use transacition  so that data enter in both table or
    // not in any table 
    await client.$transaction(async tx => {
        const run = await tx.zapRun.create({
            data: {
                zapId: zapId,
                metadata:body
            }
        });;

        await tx.zapRunOutbox.create({
            data: {
                zapRunId: run.id
            }
        })
    })

    res.json({
        meassage:"Webhook recieved"
    })

})

app.listen(3000);
