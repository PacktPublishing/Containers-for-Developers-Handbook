package main

import (
    "os"
    "fmt"
    "time"
    "path"
    "net/http"
    "net"
    "html/template"
    "math/rand"
)


func randomColor() string {
    rand.Seed(time.Now().Unix())
    colors := []string{"white","black","blue","red","grey","cyan","orange","yellow"}
    n := rand.Int() % len(colors)
    return colors[n]
}


type responseContent struct {
    CONTAINER_IP  string
    CONTAINER_NAME string
    COLOR string
    APP_VERSION string
}


func main() {
    http.HandleFunc("/text", textServer)
    http.HandleFunc("/", webServer)
    http.ListenAndServe(":3000", nil)
}


func GetLocalIP() string {
    addrs, err := net.InterfaceAddrs()
    if err != nil {
        return ""
    }
    for _, address := range addrs {
        // check the address type and if it is not a loopback the display it
        if ipnet, ok := address.(*net.IPNet); ok && !ipnet.IP.IsLoopback() {
            if ipnet.IP.To4() != nil {
                return ipnet.IP.String()
            }
        }
    }
    return ""
}



func webServer(w http.ResponseWriter, r *http.Request) {
    
    containerip:=GetLocalIP()

    hostname, err := os.Hostname()
	if err != nil {
		panic(err)
	}
    color:=os.Getenv("COLOR")

    if color == "" {color=randomColor();os.Setenv("COLOR",color)}

    content := responseContent{containerip, hostname, color, "1.0.0"}
    fp := path.Join("templates", "index.html")
    tmpl, err := template.ParseFiles(fp)

    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    if err := tmpl.Execute(w, content); err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
    }

    fmt.Fprintf(w, "%s IP: %s", r.URL.Path[1:],containerip)
    fmt.Printf("%s IP: %s\n", r.URL.Path[1:],containerip)
}

func textServer(w http.ResponseWriter, r *http.Request) {
    containerip:=GetLocalIP()
    fmt.Fprintf(w, "TEXT:\n%s IP: %s", r.URL.Path[1:],containerip)
    fmt.Printf("%s IP: %s\n", r.URL.Path[1:],containerip)
}
