### How to use
```bash
# Copy the .env and put your data (! Dont change the )
cp .env.example .env

# To install dependencies
yarn install

# To run locally
yarn cross-env NODE_ENV=dev node ./events/handler.js serverless invoke local --function concat --path ./events/handler.json

# To deploy
serverless deploy
```


Based on [this repo](https://github.com/serverless/examples/tree/master/aws-ffmpeg-layer)
