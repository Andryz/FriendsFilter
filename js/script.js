function authVK() {
    return new Promise( resolve => {
        if (document.readyState ==='complete') {
        resolve();
        } else {
            window.onload = resolve;
        }}).then(() => new Promise((resolve, reject) => {
            VK.init({
                apiId: 6770183
        });
        
        VK.Auth.login(response => {
            if (response.session) {
            resolve(response);
            } else {
                reject(new Error('Не удалось авторизоваться'));
            }
        }, 2);
}));
}

function callApi(method, params) {
    params.v = '5.76';

    return new Promise((resolve,reject) => {
        VK.api(method, params, (data) => {
            if (data.error) {
                reject(data.error);
            } else {
                resolve(data.response);                
            }
        });
    });
}

(async () => {
    try {
        await authVK();
        const friends = await callApi('friends.get', {fields: 'photo_100'});
        localStorage.data = JSON.stringify(friends);
    } catch(e) {
        console.log(e);
    }
})();

const friendsList = document.getElementById('friends');
const choosenList = document.getElementById('choosen');
const mainContent = document.querySelector('.friends_main_content');
const search = document.querySelector('.friends_main_search');
let searchLeft = document.getElementById('search-left');
let searchRight = document.getElementById('search-right');
let choosenFriends = [];
let friends = [];
let filteredFriends = [];
let filteredChoosen = [];


/* Создаем список друзей */
function createListFriends(objJSON, list) {
        
        if(list.parentNode.className.includes('friends_main_content-left')){
           objJSON = objJSON.filter(currentValue => filterByName(currentValue, searchLeft.value));
        }else{
            objJSON = objJSON;
        }
        if(list.parentNode.className.includes('friends_main_content-right')){
           objJSON = objJSON.filter(currentValue => filterByName(currentValue, searchRight.value));
        }else{
            objJSON = objJSON;
        }
    list.innerHTML = '';
    for (let {id, first_name, last_name, photo_100} of objJSON) {
        const li = document.createElement('li');
        li.draggable = true;
        li.id = id;
        const img = document.createElement('img');
        img.src = photo_100;
        img.className = 'photo';
        const nameDiv = document.createElement('div');
        nameDiv.className = 'name';
        const name = document.createElement('span');
        name.textContent = `${last_name} ${first_name}`;                
        const button = document.createElement('i');
        button.className = (list.id === 'friends') ? 'flaticon-add' : 'flaticon-delete';
        nameDiv.appendChild(img);        
        nameDiv.appendChild(name); 
        li.appendChild(nameDiv);
        li.appendChild(button);    

        list.appendChild(li);
    }    
}
if (!localStorage.dataSave) {
    friends = JSON.parse(localStorage.data).items;
    createListFriends(friends, friendsList);
} else {
    friends = JSON.parse(localStorage.friends);
    choosenFriends = JSON.parse(localStorage.choosenFriends);
    createListFriends(friends, friendsList);
    createListFriends(choosenFriends, choosenList);         
}

/* Фильтр*/

function filterByName (item, chunk) {
    let fullName = `${item.first_name} ${item.last_name}`;

    return fullName.toLowerCase().includes(chunk.toLowerCase())
}

search.addEventListener('keyup', event => {
    let input = event.target;
    switch (input.className) {
        case 'friends_main_search-left':
            filteredFriends = friends.filter(item => filterByName(item, input.value));                
            createListFriends(filteredFriends, friendsList);
            break;
        case 'friends_main_search-right':
            filteredChoosen = choosenFriends.filter(item => filterByName(item, input.value));                
            createListFriends(filteredChoosen, choosenList);
            break;
        }
    }
);
/* drag n drop */

function makeDnD(zones) {
    let currentDrag;

    zones.forEach(zone => {
        zone.addEventListener('dragstart', (e) => {
            currentDrag = { source: zone, node: e.target };
          e.dataTransfer.setData('text/html', 'dragstart');
        });

        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        zone.addEventListener('drop', (e) => {
            if (currentDrag) {
                e.preventDefault();

                if (currentDrag.source !== zone) {
                    switch (currentDrag.source.id) {
                        case 'friends':
                            addFriend(currentDrag.node.id, friends, choosenFriends);
                            break;
                        case 'choosen':
                            addFriend(currentDrag.node.id, choosenFriends, friends);
                            break;    
                    }
                    createListFriends(friends, friendsList);    
                    createListFriends(choosenFriends, choosenList);    
                }
                currentDrag = null;
            }
        });
    })
}

makeDnD([friendsList,choosenList]);

/*Добавить друга */

function addFriend(id, from, to) {
    for (let i = 0; i < from.length; i++) {
        if (from[i].id === Number.parseInt(id)) {
        let friend = from.splice(i, 1)[0];
        to.push(friend);
        };
    }
}

mainContent.addEventListener('click', event => {
    let id = event.target.parentNode.id;            
    switch(event.target.className) {
        case 'flaticon-add':
            addFriend(id, friends, choosenFriends);
            break;
        case 'flaticon-delete':
            addFriend(id, choosenFriends, friends);
            break;
        }
    createListFriends(friends, friendsList);    
    createListFriends(choosenFriends, choosenList);
})

/* Сохранить в localStorage  */

let saveButton = document.querySelector('.friends_main_footer-button');

saveButton.addEventListener('click', event => {
    localStorage.dataSave = 'true';
    localStorage.friends = JSON.stringify(friends);
    localStorage.choosenFriends = JSON.stringify(choosenFriends);
    alert('data saved');
});