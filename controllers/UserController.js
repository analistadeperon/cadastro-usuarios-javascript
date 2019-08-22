class UserController{

    constructor(formIdCreate, formIdUpdate, tableId){

        this.formEl = document.querySelector(formIdCreate)
        this.formUpdateEl = document.querySelector(formIdUpdate)
        this.tableEl = document.querySelector(tableId)

        this.onSubmit()
        this.onEdit()
        this.selectAll()

    }

    onEdit(){

        document.querySelector("#box-user-update .btn-cancel").addEventListener("click", () => {

            this.showPanelCreate()

        })

        this.formUpdateEl.addEventListener("submit", event => {

            event.preventDefault()

            let btn = this.formUpdateEl.querySelector("[type = submit]")
            btn.disabled = true

            let values = this.getValues(this.formUpdateEl)

            let index =  this.formUpdateEl.dataset.trIndex

            let tr = this.tableEl.rows[index]

            let userOld = JSON.parse(tr.dataset.user)

            let result = Object.assign({}, userOld, values)

            this.showPanelCreate()

            this.getPhoto(this.formUpdateEl).then(
                (content) => {

                    if(!values._photo) {
                        result._photo = userOld._photo
                    }
                    else{
                        result._photo = content
                    }

                    let user = new User()

                    user.loadFromJson(result)

                    user.save()

                    this.getTr(user, tr)
        
                    this.updateCount()

                    this.formUpdateEl.reset()

                    btn.disabled = false

                },
                (e) => {
                    console.error(e)
                }
            )

        })

    }

    onSubmit(){

        // Seleciona o formulário no botão submit
        this.formEl.addEventListener("submit", event => {

            // Desativa o comportamento comum do evento
            event.preventDefault()

            let btn = this.formEl.querySelector("[type = submit]")

            btn.disabled = true

            let values = this.getValues(this.formEl)

            if(!values) return false

            this.getPhoto(this.formEl).then(
                (content) => {

                    values.photo = content

                    values.save()

                    this.addLine(values)

                    this.formEl.reset()

                    btn.disabled = false

                },
                (e) => {
                    console.error(e)
                }
            )

        })

    }

    getPhoto(formEl){

        return new Promise((resolve, reject) => {

            let fileReader = new FileReader()

            let img = [...formEl.elements]
            let elements = img.filter(item => {
    
                if (item.name === 'photo') return item
    
            })
    
            let file = elements[0].files[0]
    
            fileReader.onload = () => {
    
                resolve(fileReader.result)
    
            }

            fileReader.onerror = (e) => {

                reject(e)

            }
    
            if(file){
                fileReader.readAsDataURL(file)
            } else{
                resolve('dist/img/boxed-bg.jpg')
            }

        })

    }
   

    getValues(formEl) {

        let user = {}
        let idValid = true

        let arrayEl = [...formEl.elements]

        arrayEl.forEach((field, index) => {

            if (['name', 'email', 'password'].indexOf(field.name) > -1 && !field.value) {

                field.parentElement.classList.add('has-error')
                idValid = false

            }

            // Válida o radio de sexo do usuário
            if(field.name == "gender") {
                
                // Recebe as informações no JSON
                if(field.checked) user[field.name] = field.value
        
            } else if(field.name == "admin"){

                user[field.name] = field.checked

            } else {
        
                // Recebe as informações no JSON
                user[field.name] = field.value
        
            }   
        
        })

        if(!idValid) return false
    
        return new User(
            user.name,
            user.gender,
            user.birth,
            user.country,
            user.email,
            user.password,
            user.photo,
            user.admin
        )

    }

    selectAll(){
        let users = User.getUserStorage()

        users.forEach(data => {

            let user = new User()

            user.loadFromJson(data)

            this.addLine(user)

        })


    }

    addLine(dataUser) {

        let tr = this.getTr(dataUser)

        this.tableEl.appendChild(tr)

        this.updateCount()
    
    }

    getTr(dataUser, tr = null){
        if (tr=== null) tr = document.createElement('tr')

        tr.dataset.user = JSON.stringify(dataUser)

        tr.innerHTML = `
            
            <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
            <td>${dataUser.name}</td>
            <td>${dataUser.email}</td>
            <td>${(dataUser.admin ? 'Sim' : 'Não')}</td>
            <td>${dataUser.register.toLocaleDateString()}</td>
            <td>
                <button type="button" class="btn btn-edit btn-primary btn-xs btn-flat" onclick="interacaoTela()">Editar</button>
                <button type="button" class="btn btn-danger btn-delete btn-xs btn-flat">Excluir</button>
            </td>
        
        `;

        this.addEventsTr(tr)

        return tr

    }

    addEventsTr(tr){

        tr.querySelector(".btn-delete").addEventListener("click", () => {

            if(confirm("Deseja realmente excluir?")) {

                let user = new User()

                user.loadFromJson(JSON.parse(tr.dataset.user))

                user.remove()

                tr.remove()

                this.updateCount()

            }

        })

        tr.querySelector(".btn-edit").addEventListener("click", () => {

            let json = JSON.parse(tr.dataset.user)

            this.formUpdateEl.dataset.trIndex = tr.sectionRowIndex

            for(let name in json){

                let field = this.formUpdateEl.querySelector("[name=" + name.replace("_", "") + "]")

                if(field){

                    switch(field.type){

                        case 'file':
                            continue
                        break;

                        case 'radio':
                            field = this.formUpdateEl.querySelector("[name=" + name.replace("_", "") + "][value=" + json[name] + "]")
                            field.checked = true
                        break;

                        case 'checkbox':
                            field.checked = json[name]
                        break;

                        default:
                            field.value = json[name]
                        break;

                    }

                }

            }

            this.formUpdateEl.querySelector(".photo").src = json._photo

            this.showPanelUpdate()

            this.updateCount()

        })

    }

    showPanelCreate(){

        document.querySelector("#box-user-update").style.display = "none"

    }

    showPanelUpdate(){

        document.querySelector("#box-user-create").style.display = "none"

    }

    updateCount(){

        let numberUser = 0
        let numberAdmin = 0

        let tableTr = [...this.tableEl.children]
        tableTr.forEach(tr => {

            let user = JSON.parse(tr.dataset.user)

            numberUser++

            if(user._admin == true) { numberAdmin++ }

        })

        document.querySelector("#number-users").innerHTML = numberUser
        document.querySelector("#number-users-admin").innerHTML = numberAdmin

    }

}