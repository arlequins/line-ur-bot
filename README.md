# line-ur-bot

## install
```
npx firebase-tools login
npx firebase-tools use {project_name}
npx firebase-tools init
```

## setup
```
cd functions
cp .env.sample .env
```

`GCP_SA_KEY`
- `IAM` -> `service Accounts`
- `keys`を作成してください。
- `base64 -i {file}`で作成してください。

## deploy
```
npx firebase-tools deploy
```

## todo
- [ ] sync master house and room
