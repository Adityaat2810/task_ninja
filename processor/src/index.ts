import { PrismaClient } from "@prisma/client"
import { Kafka } from "kafkajs"
const client = new PrismaClient();

const TOPIC_NAME= 'zap-events-events'
const kafka = new Kafka({
  clientId:"outbox-processor",
  brokers:['localhost:9092']
})

async function main(){
    const producer =  kafka.producer();
    await producer.connect();
    
    // infinite loop 
    while(1){
      const pendingRows = await client.zapRunOutbox.findMany({
        where:{},
        take:10
      }) 

      // publish this on kafka 
      producer.send({
        topic:TOPIC_NAME,
        messages: pendingRows.map(r=>{
          return{
            value:r.zapRunId
          }
        })
        
      }) 

      // delete rows after publishing '
      await client.zapRunOutbox.deleteMany({
        where:{
          id:{
            in:pendingRows.map(r=>r.id)
          }
        }
      })
        

    }
      
}

main()