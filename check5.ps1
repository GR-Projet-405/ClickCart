$cp = "C:\Users\sachi\.m2\repository\org\springframework\spring-web\6.2.3\spring-web-6.2.3.jar"
$javap = "C:\Program Files\Java\jdk-24\bin\javap.exe"
& $javap -classpath $cp -verbose org.springframework.web.bind.annotationPathVariable 2>&1 | Select-Object -First 20