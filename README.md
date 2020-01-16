# Intelligence Widget Action

Github Action to Upload to S3 Bucket

Uploads to S3 Bucket

```
name: Upload
on:
  push
jobs:
  upload:
    runs-on: ubuntu-latest
    steps:
      - name: Initializing action
        uses: actions/checkout@master

      - name: Upload
      - uses: serendipity-ai/intelligence-widget-action@master
        with:
          SRC: "./dist"
          DEST: "./"
          AWS_S3_BUCKET: ${{ secrets.AWS_S3_BUCKET }}
          AWS_REGION: ${{ secrets.AWS_REGION }}
          AWS_SECRET_ID: ${{ secrets.AWS_SECRET_ID }}
          AWS_SECRET_KEY: ${{ secrets.AWS_SECRET_KEY }}
```
