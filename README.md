# hqporner-dl
Download videos from HQPorner

## Usage

Install dependencies
```
npm i
```

See help menu
```
ts-node . --help
```

Download multiple URLs
```
ts-node . url1 url2 url3 [...options]
```

By default, videos will be downloaded in 1080p into ./videos

Get video info (no download)
```
ts-node . --dry url1
```

Provide download folder
```
ts-node . url1 --folder /home/videos
```
