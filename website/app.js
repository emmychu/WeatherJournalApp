// Global Variables
const baseURL = "http://api.openweathermap.org/data/2.5/weather?zip="
const zipText = document.getElementById("zip");
const zipButton = document.getElementById("generate");
const updateSubmit = document.getElementById("journal-submit");
const userName = document.getElementById("name-value");
const body = document.getElementsByTagName("body")[0];

//Date functions
let today = new Date();
let newDate = `${(today.getMonth()+ 1)}.${+ today.getDate()}.${today.getFullYear()}`;
let currentHour = today.getHours()
let currentTime = getCurrentTime()

// Personal API Key for OpenWeatherMap API
const api = ",us&units=imperial&appid=924ecca5b51816bbb81c4d4d9fe65e5b"

//Event Listeners
    // Event listener to add function to existing HTML DOM element
    zipButton.addEventListener("click", submitZip);
    document.getElementById("zip").addEventListener("keypress", function(enterKey){
        if(enterKey.key === 'Enter'){
            submitZip()
        }
    })

    //Event listener for Journal Update
    updateSubmit.addEventListener("click", submitEntry);

/* Functions called by event listener */
    //Function to submit Zipcode
    function submitZip(){
        const userZip = zipText.value;
        if(zipText.value.length === 5){
            getWeather(baseURL, userZip, api);
        }else{
            alert("Please input a valid 5 digit zipcode!");
        }
    }

    //Function to submit Entry
    async function submitEntry(){
        let userFeeling = document.getElementById("feels").value
        let userBox = document.getElementById("description-box").value
        if(userFeeling.length === 0 || userBox.length === 0){
            alert("Please make sure both boxes are not empty! Thank you :)")
        }else{
            sendUserData(userFeeling,userBox)
            document.getElementById("feels").value = ""
            document.getElementById("description-box").value = ""
        }
    }

// Function to GET Web API Data
const getWeather = async(baseURL, zip, api) => { 
    let response = await fetch(baseURL + zip + api);
    try{
        let data = await response.json()
        changeHeader(data);
        backgroundUpdate(data['weather'][0]['id']);
    }
    catch(error){
        console.log("error", error);
    }
}

// Function to POST data
const postData = async (url = '', data = {})=>{
    const response = await fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers:{
            'Content-Type': 'application/json',
        },
        body:JSON.stringify(data),
    });
    try{
        const newData = await response.json();
        return newData
    }catch(error){
        console.log("error", error);
    }
}

//Function to get Project Data
const retrieveData = async (url='') =>{ 
    const request = await fetch(url);
    try {
        const allData = await request.json();
        return allData;
    }
    catch(error) {
      console.log("error", error);    
    }
  };
  
// TODO-Call the chained function
function sendUserData(feeling,entry){
    const userZip = zipText.value;
    const currentTemp = document.getElementById("temp").innerText;
    const weatherText = document.getElementById("weather-icon").alt;
    const weatherID = weatherText.slice(weatherText.length-3 , weatherText.length)
    postData('/add', {
        'zipcode': userZip,
        'temperature': currentTemp,   
        'date': newDate,
        'feeling': feeling,
        'entry': entry,
        'time': currentTime,
        'militaryhour': currentHour,
        'weatherID': weatherID
    })
    .then(
        updateCard()
    )
}

//UI Update Functions

    //Function to change heading after zip submission //
    function changeHeader(data){
        let currentWeather = data.weather[0].description;
        let currentTemp = data.main.temp
        document.getElementById("welcome").insertAdjacentHTML("afterend",`<div id="today-weather"><h2>The current weather is <a class ="current-weather" >${currentWeather}</a> and the temperature is <a id = "temp" class ="current-weather">${currentTemp}°F</a></h2></div>`)
        document.getElementById("today-weather").style.cssText = `grid-area: zip; font-size: 12px; color: navy; padding-top:0px;`;
        const zipElements = document.getElementsByClassName("zipcode")
        for(let n = 0; n < zipElements.length; n++){
            zipElements[n].remove();
        };
        alert("Now please, how was your day? :)")
    }

    //Function to update card after entry submission
    function updateCard(){
        retrieveData('/all')
        .then((data) => {
            let cardHolder = document.getElementsByClassName("card-holder")[0];
            cardHolder.innerHTML = ""
            generateEntries(data)
        });       
    }

    //Function to generate old entries
    function generateEntries(data){
        const dates = Object.keys(data);
        let threeDays = getDates(dates)
        let oldEntries = getEntries(data,threeDays)
        console.log(oldEntries)
        let cardHolder = document.getElementsByClassName("card-holder")[0];
        for(let entry = oldEntries.length-1; entry >= 0; entry--){
            let hour = oldEntries[entry]['militaryhour']
            let weatherID = oldEntries[entry]['weatherID']
            let weatherInfo = iconGeneration(weatherID,hour)
            cardHolder.insertAdjacentHTML("afterBegin",
            `<card id="card-${entry}" class = "entries">
                <h2 class = "card-heading">${oldEntries[entry]['feeling']}</h2>
                <div class = "weather">
                    <img class="entry-icons" src=${weatherInfo[0]} alt=${weatherInfo[1]}>
                </div>
                <p class = "entry">${oldEntries[entry]['entry']}</p>
                <a class="entry-date">${oldEntries[entry]['date']} at ${oldEntries[entry]['time']}</a>`
            )
        }
        document.getElementById("card1").remove();
    }

    //Function to retrieve last 3 dates
    function getDates(dates){
        let threeDays = []
        if(dates.length <= 3){
            threeDays = dates
            return threeDays
        }else{
            for(let index = dates.length -1; index > dates.length -4; index--){
            threeDays.push(dates[index]);
            return threeDays
            }
        }
    }
    //Function to retrieve entries of the last three days
    function getEntries(data,threeDays){
        entries = []
        for(let day = threeDays.length -1; day >= 0; day-- ){
            let dayEntries = data[threeDays[day]]
            for(let entryCount = dayEntries.length-1 ; entryCount >= 0; entryCount--){
                entries.push(dayEntries[entryCount])
            }
        }
        return entries
    }

    //Function to change background dependent on weather
    function backgroundUpdate(weatherID){
        let weatherInfo = document.getElementById("today-weather")
        weatherInfo.insertAdjacentHTML("beforebegin",`<img id="weather-icon" height="60px" width:"100%" alt="weather icon for current weather">`)
        let weatherIcon = document.getElementById("weather-icon")
        weatherIcon.style.cssText= `gridArea = "icon"; padding-top:0px; padding-bottom:0px;`
        switch(true){
            case (weatherID >= 200 && weatherID < 300):
                weatherIcon.src = "css/images/icons/thunderstorm.png"
                weatherIcon.alt = "thunderstorm icon" + weatherID
                if(currentHour > 6 && currentHour < 18){
                    body.style.backgroundImage = `url("css/images/wallpapers/thunderstorm/thunderstorm-wallpaper-1.jpg")`
                }else{
                    body.style.backgroundImage = `url("css/images/wallpapers/thunderstorm/ws_Thunderstorm_1920x1080.jpg")`
                }
                break;
            case (weatherID >=300 && weatherID <= 600):
                if(currentHour > 6 && currentHour < 18){
                    weatherIcon.src = "css/images/icons/rain-day.png"
                    weatherIcon.alt = "rainy day icon" + weatherID
                    body.style.backgroundImage = `url("css/images/wallpapers/rainy/800696.jpg")`
                }else{
                    body.style.backgroundImage = `url("css/images/wallpapers/rainy/Rain-on-glass-wallpaper-HD-free-download.jpg")`
                    weatherIcon.src = "css/images/icons/rain-night.png"
                    weatherIcon.alt = "rainy night icon" + weatherID
                }
                break;
            case (weatherID <= 700):
                weatherIcon.src = "css/images/icons/snow.png"
                weatherIcon.alt = "snow icon" + weatherID
                if(currentHour > 6 && currentHour < 18){
                    body.style.backgroundImage = `url("css/images/wallpapers/icy/sunny-winter-day-42229-1920x1080.jpg")`
                }else{
                    body.style.backgroundImage = `url("css/images/wallpapers/icy/1474165.jpg")`
                }
                break;
            case (weatherID > 800):
                if(currentHour > 6 && currentHour < 18){
                    weatherIcon.src = "css/images/icons/cloudy-day.png"
                    weatherIcon.alt = "cloudy day icon" + weatherID
                    body.style.backgroundImage = `url("css/images/wallpapers/cloudy/14-146214_sky-clouds-hd-cloudy-sky.jpg")`
                }else{
                    weatherIcon.src = "css/images/icons/cloudy-night.png"
                    weatherIcon.alt = "cloudy night icon" + weatherID
                    body.style.backgroundImage = `url("css/images/wallpapers/cloudy/teahub.io-pink-sky-wallpaper-3231373.png")`
                }
                break;
            default:
                if(currentHour > 6 && currentHour < 18){
                    weatherIcon.src = "css/images/icons/clear-day.png"
                    weatherIcon.alt = "clear day icon" + weatherID
                    break
                }else{
                    weatherIcon.src = "css/images/icons/clear-night.png"
                    weatherIcon.alt = "cloudy night icon" + weatherID
                    body.style.backgroundImage = `url("css/images/wallpapers/clear/148418.jpg")`
                }
                break
        }
    } 
    //Function to return oldIcons
    function iconGeneration(weatherID,hour){
        switch(true){
            case (weatherID >= 200 && weatherID < 300):
                return ["css/images/icons/thunderstorm.png","thunderstorm icon"]
            case (weatherID >=300 && weatherID <= 600):
                if(hour > 6 && hour < 18){
                    return ["css/images/icons/rain-day.png","rainy day icon"]
                }else{
                    return ["css/images/icons/rain-night.png","rainy night icon"]
                }
            case (weatherID <= 700):
                return ["css/images/icons/snow.png","snow icon"]
            case (weatherID > 800):
                if(hour > 6 && hour < 18){
                    return ["css/images/icons/cloudy-day.png","cloudy day icon"]
                }else{
                    return ["css/images/icons/cloudy-night.png","cloudy night icon"]
                }
            default:
                if(hour > 6 && hour < 18){
                    return ["css/images/icons/clear-day.png", "clear day icon"]
                }else{
                    return ["css/images/icons/clear-night.png", "clear night icon"]
                }
            }
        }

    //Set time
    function getCurrentTime(){
        let hour = today.getHours()
        let minutes = today.getMinutes()
        if(hour > 12){
            hour -= 12;
            if(minutes < 10){
                return `${hour}:0${minutes}pm`
             }else{
                return `${hour}:${minutes}pm`
            }
        }else{
            if(minutes < 10){
                return `${hour}:0${minutes}am`
            }else{
                return `${hour}:${minutes}am`
            }
        }
    }

//Remove weather icon from entry if screen size too small
    document.addEventListener("resize",()=>{
        if(window.innerWidth < 500){
            alert("window")
        let iconList = document.getElementsByClassName("entry-icons")
        console.log("hi")
        for(let icon = 0; icon < iconList; icon++){
            iconList[icon].remove()
        }
        }
    })