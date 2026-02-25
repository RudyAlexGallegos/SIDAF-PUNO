# Usar imagen de Java
FROM eclipse-temurin:17-jdk-alpine AS build

# Establecer directorio de trabajo
WORKDIR /app

# Copiar los archivos necesarios para Maven (desde backend/ en el contexto de build)
COPY backend/pom.xml .
COPY backend/mvnw .
COPY backend/mvnw.cmd .
COPY backend/.mvn .mvn

# Copiar el código fuente
COPY backend/src ./src

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
