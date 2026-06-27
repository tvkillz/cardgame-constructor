# {{DOMAIN}} — {{PROJECT}} ({{ROLE}}, pm2 port {{PORT}})
# TLS: add manually with certbot --nginx (not generated here).

server {
    listen 80;
    listen [::]:80;
    server_name {{DOMAIN}}{{#WWW}} www.{{DOMAIN}}{{/WWW}};

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    client_max_body_size 50m;

{{#STAGING_AUTH}}
    auth_basic "Restricted";
    auth_basic_user_file /etc/nginx/constructor-htpasswd;

{{/STAGING_AUTH}}
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
