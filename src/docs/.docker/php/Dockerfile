FROM php:8.1-apache

# Install packages under Debian
RUN pecl install xdebug

# Copy xdebug.ini to /usr/local/etc/php/conf.d/
COPY conf/ /usr/local/etc/php/conf.d/

RUN cd /usr/local/lib/php/extensions \
    && echo "zend_extension=$(find "$(cd ..; pwd)" -name xdebug.so)" >> /usr/local/etc/php/conf.d/xdebug.ini

COPY install-composer.sh /tmp/
RUN bash /tmp/install-composer.sh

# update the user for linux usage
RUN usermod -u 1000 www-data && groupmod -g 1000 www-data
