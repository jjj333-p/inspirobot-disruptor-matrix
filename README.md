# inspirobot-disruptor-matrix

Every x messages of a monologue, the bot disrupts with an inspiring quote from https://inspirobot.me/

It rarely hits the mark but sometimes it does...
![image](https://github.com/user-attachments/assets/e6aa562a-9465-4e77-95be-257da98b311e)

# Usage

This bot is very simple, there is one command and for the most part it just sits in the background. You can invite my bot `@inspirobot-disruptor:matrix.org` or host it yourself.

- After x amount of messages consecutively from one person in a room (configurable in the login.yaml file, default 10), it will post an inspiring quote image.
- `!help` will bring you back to this github
- You can run `!inspire` to fetch one manually
- Do note, this bot does not support encryption

![Screenshot 2024-09-13 at 18-49-49 Element 28 On the third day of 9_11 Osama gave to me](https://github.com/user-attachments/assets/1ae39b9e-7e6c-4678-bac8-fe05e72a27b7)

# Hosting

### What you need:

- Git (optional)

- nodejs 

    - This bot is tested to work with node `v20.12.2` and `v18.20.2`
    
    - Most distros will install with `sudo <package manager> install nodejs npm`

    - On Debian stable the Node version included in the repos are ancient and can cause issues. Personally I installed node through snap and use that, but you can also download the binary manually or complile yourself.

- npm

- A Matrix account for the bot to use. You can use curl, or grab your token from element

    - Navigate to Settings > Help & About > Advanced > Access Token

### What to do:

- If using git, clone the directory and cd into it
    ```
    git clone https://github.com/jjj333-p/inspirobot-disruptor-matrix
    cd inspirobot-disruptor-matrix
    ```

- Copy the example config file in `example/login.yaml` to `db/login.yaml`
    ```
    mkdir db
    cp example/login.yaml db/login.yaml
    ```

- Follow the commented instructions found in `db/login.yaml`, entering in your homeserver and access token

- Install dependencies by running `npm install`

- Run the bot with `node index.js`

    - `snap run node index.js` for the users using snap

- (Optional) Add to systemd services

    - Edit the following example to how you invoke the bot on your system, and add it to `/etc/systemd/system/inspirobot-disruptor-matrix.service`

        ```
        [Unit]
        Description=matrix bot that inspires

        [Service]
        RestartSec=2s
        Type=simple
        User=joseph
        WorkingDirectory=/home/joseph/inspirobot-disruptor-matrix/
        ExecStart=/usr/bin/snap run node /home/joseph/inspirobot-disruptor-matrix/index.js
        Restart=always

        [Install]
        WantedBy=multi-user.target
        ```

    - enable and start the bot on startup with

        ```
        sudo systemctl daemon-reload
        sudo systemctl enable --now inspirobot-disruptor-matrix
        ```
