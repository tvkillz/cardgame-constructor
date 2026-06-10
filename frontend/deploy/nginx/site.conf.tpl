# {{DOMAIN}} — {{PROJECT}} (pm2 prod port {{PORT}})

server {
    listen 80;
    listen [::]:80;
    server_name {{DOMAIN}}{{#WWW}} www.{{DOMAIN}}{{/WWW}};

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

{{#SSL}}
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name {{DOMAIN}}{{#WWW}} www.{{DOMAIN}}{{/WWW}};

    ssl_certificate {{SSL_CERT}};
    ssl_certificate_key {{SSL_KEY}};
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

{{/SSL}}
{{^SSL}}
    # HTTP-only (run setup-vps.sh ssl after DNS points here)
{{/SSL}}

    client_max_body_size 50m;

    auth_basic "Restricted";
    auth_basic_user_file /etc/nginx/constructor-htpasswd;

    location / {
        proxy_pass http://127.0.0.1:{{PORT}};
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_read_timeout 86400;
    }
}
