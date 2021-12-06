FROM php:7.4-apache

# Install packages under Debian
RUN pecl install xdebug

# Copy xdebug.ini to /usr/local/etc/php/conf.d/
COPY conf/ /usr/local/etc/php/conf.d/

RUN cd /usr/local/lib/php/extensions \
    && echo "zend_extension=$(find "$(cd ..; pwd)" -name xdebug.so)" >> /usr/local/etc/php/conf.d/xdebug.ini
# Since this Dockerfile extends the official Docker image `wordpress`,
# and since `wordpress`, in turn, extends the official Docker image `php`,
# the helper script docker-php-ext-enable (defined for image `php`)
# works here, and we can use it to enable xdebug:

COPY install-composer.sh /tmp/
RUN bash /tmp/install-composer.sh

# update the user for linux usage
RUN usermod -u 1000 www-data && groupmod -g 1000 www-data
