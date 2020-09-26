const { Component } = require("@serverless/core")
const AWS = require("aws-sdk")

const create = async (component, name) => {
  const dynamodb = new AWS.DynamoDB({
    region: "ap-northeast-1",
    credentials: component.context.credentials.aws,
  })

  const res = await dynamodb
    .createTable({
      TableName: name,
      AttributeDefinitions: [
        {
          AttributeName: "PK",
          AttributeType: "S"
        },
        {
          AttributeName: "SK",
          AttributeType: "S"
        }
      ],
      KeySchema: [
        {
          AttributeName: "PK",
          KeyType: "HASH"
        },
        {
          AttributeName: "SK",
          KeyType: "RANGE"
        }
      ],
      BillingMode: "PAY_PER_REQUEST"
    })
    .promise()

  return { 
    tanleArn: res.TableDescription.TableArn,
    name: name
  }
}

const remove = async component => {
  const dynamodb = new AWS.DynamoDB({
    region: "ap-northeast-1",
    credentials: component.context.credentials.aws,
  })

  await dynamodb
    .deleteTable({
      TableName: component.state.name
    })
    .promise()

  return true
}

class MyComponent extends Component {
  async default(inputs){
    this.context.debug("Deploying!")
    await create(this, inputs.name)

    this.state.name = inputs.name
    await this.save()
  }

  async remove(){
    this.context.debug("Removing table...")
    await remove(this)
    this.context.debug("Finished Removing!")
  }
}

module.exports = MyComponent
