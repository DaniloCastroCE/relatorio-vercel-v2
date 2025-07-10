class Loading {
    constructor() {
    }
    
    control(op) {
        this.loading = document.querySelector(".loading");
        if (op === "open") {
            this.loading.classList.remove("display-none");
        } else if (op === "close") {
            this.loading.classList.add("display-none");
        }
    }

}