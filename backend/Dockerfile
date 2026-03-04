# Usar imagen de Java
FROM eclipse-temurin:17-jdk-alpine AS build

# Establecer directorio de trabajo
WORKDIR /app

# Copiar pom.xml y wrapper desde la carpeta backend/backend/
COPY backend/backend/pom.xml .
COPY backend/backend/mvnw .
COPY backend/backend/mvnw.cmd .
COPY backend/backend/.mvn .mvn

# Copiar el código fuente
COPY backend/backend/src ./src

# Dar permisos de ejecución al Maven wrapper
RUN chmod +x mvnw

# Construir la aplicación
RUN ./mvnw clean package -DskipTests

# Imagen de producción
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copiar el JAR generado
COPY --from=build /app/target/*.jar app.jar

# Exponer puerto
EXPOSE 8083

# Comando de inicio
ENTRYPOINT ["java", "-jar", "app.jar"]
