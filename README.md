# SCRAMBOT!

SCRAMBOT is a tool designed to allow org leaders/members for Star Citizen orgs to alert orgmates to events happening 'in the verse'. The aim is to provide a light weight solution that intergrates the different common communication platforms used by gaming communities (Intially discord, DSC-SRS and Steam) and provide a unified way to inform members and co-ordinate secure communications across each channel of ongoing events or '**Scrambles**'.

## Tech Stack
Main language : node.js
Database: MongoDB
Frontend: EJS
Containerization: Docker
Hosting: A rasbery Pi
Please note that secrets and other params are stored in a .env file and have not been uploaded to github. Below is an example of the .env. Please use your own secrets.

    NODE_ENV=development
    MONGODB_URI=mongodb://definitelyNotRoot:MYMONGODBPW@mongo:27017/
    MONGO_INITDB_ROOT_USERNAME=definitelyNotRoot
    MONGO_INITDB_ROOT_PASSWORD=MYMONGODBaPW
    ME_CONFIG_MONGODB_ADMINUSERNAME=definitelyNotRoot
    ME_CONFIG_MONGODB_ADMINPASSWORD=MYMONGODBPW
    ME_CONFIG_MONGODB_URL=mongodb://definitelyNotRoot:MYMONGODBPWx@mongo:27017/
    ME_CONFIG_BASICAUTH=false
    DISCORD_CLIENT=1234567891011
    DISCORD_SECRET=<Please see https://discord.com/developers for information about configuring this>
    DISCORD_TOKEN=<Discord Token>
    DISCORD_CALLBACK=https://your-Ngrok-URL-or-whatever.app/auth/discord/callback
    SESSION_SECRET=<also get this from Discord.com/developers>
    ENCRYPTION_KEY=<any 32-byte AES encryption key>
You can generate your own encryption key with the following powershell

[Convert]::ToBase64String((New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes(32))

## Current Features
Create a scramble

![](https://cdn.discordapp.com/attachments/959680266564153436/1302670749319954545/image.png?ex=675914ed&is=6757c36d&hm=50acda4b09e0b6942bb5f80f3f17472ae134b44ff59520f962aaaef2c007a6ce&=)
Upon submitting a scramble, all members currently subscribed to scrambles will receive a discord direct message with information about the scramble and an invite to a private voice channel to use for the purposes of the scramble. Our org found this valuable as we previously organized communications on our public facing discord server for ease of use. Scrambot enables fast spinup and spindown of adhoc voice channels with permissions limited to those responding to the alert.

![](https://cdn.discordapp.com/attachments/959680266564153436/1312002666267803678/image.png?ex=675969b3&is=67581833&hm=1a7b8a50bd1724ec6680a113d3ca890323b62c674bfebabd45a852de2693ded8&=)

SCRAMBOT will also authenticate users via Discord Oauth2, this currently does nothing aside from populating their user accounts with additional information as session persistence is yet to be implemented

User data is stored relatively securely by encrypting all info in the db with AES

## Contributing
Any code contributions are welcome, make a branch and submit a PR. Further work on Discord Auth and session persistance is ongoing. Help with additional intergrations (specifically) DCS-SRC would be welcome as I'm, new to it, I just know the org also uses it.



[![SPAAACCCEEEE!!!](https://m.media-amazon.com/images/I/61ZQmaIOD2L._AC_SX679_.jpg)](https://www.youtube.com/watch?v=g1Sq1Nr58hM)
