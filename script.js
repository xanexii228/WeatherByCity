// Исправленный класс WeatherApp (без изменений в этой части)
class WeatherApp {
    constructor(lastCountry) {
        this.apiKey = '8e4aef1e7f9321df732788fbb60409d7';
        this.baseUrl = 'https://api.openweathermap.org/data/2.5';
        
        this.lastCountry = localStorage.getItem('lastCity') || lastCountry;
        this.chosen = localStorage.getItem('temperatureUnit') || 'C';
        
        this.init();
    }
    
    init() {
        document.getElementById('search-btn').addEventListener('click', () => {
            this.searchWeather();
        });
        document.getElementById('city-input').addEventListener('keypress', (e) => {
            if (e.key == 'Enter') this.searchWeather();
        });
        
        if (this.lastCountry && this.lastCountry !== '0') {
            this.getWeather(this.lastCountry);
        } else {
            this.getWeather('Moscow');
        }
    }
    
    async searchWeather() {
        const city = document.getElementById('city-input').value.trim();
        if (city) {
            this.lastCountry = city;
            localStorage.setItem('lastCity', city); 
            this.getWeather(city);
        }
    }
    
    async getWeather(city) {
        try {
            const response = await fetch(
                `${this.baseUrl}/weather?q=${city}&appid=${this.apiKey}&units=metric&lang=ru`
            );
            
            const data = await response.json();
            
            if (data.cod !== 200) {
                throw new Error('Город не найден');
            }
            
            this.displayWeather(data);
            
        } catch (error) {
            console.error('Ошибка:', error);
            document.getElementById('error-message').textContent = error.message;
            document.getElementById('error-message').style.display = 'block';
        }
    }
    
    displayWeather(data) {
        switch(this.chosen) {
            case "C": 
                document.querySelector('.temperature').textContent = `${Math.round(data.main.temp)}°C`;
                document.querySelector('.detail-item:nth-child(3) span:last-child').textContent = `${Math.round(data.main.feels_like)}°C`;
                break;
            case "F":
                document.querySelector('.temperature').textContent = `${Math.round(data.main.temp * (9/5) + 32)}°F`;
                document.querySelector('.detail-item:nth-child(3) span:last-child').textContent = `${Math.round(data.main.feels_like * (9/5) + 32)}°F`;
                break;
        }
        document.getElementById('error-message').style.display = 'none';
        document.querySelector('.description').textContent = data.weather[0].description;
        document.querySelector('.location').textContent = `${data.name}, ${data.sys.country}`;
        document.querySelector('.detail-item:nth-child(1) span:last-child').textContent = `${data.main.humidity}%`;
        document.querySelector('.detail-item:nth-child(2) span:last-child').textContent = `${Math.round(data.wind.speed)} м/с`;
        this.updateAudioBasedOnWeather(data);
    }
    
    updateTemperatureUnit(unit) {
        this.chosen = unit;
        localStorage.setItem('temperatureUnit', unit);
        if (this.lastCountry && this.lastCountry !== '0') {
            this.getWeather(this.lastCountry);
        }
    }
    
    updateAudioBasedOnWeather(data) {
    const weatherType = data.weather[0].description;
        if (weatherType === 'пасмурно') {
            changeAudioSourceDirectly('raining.mp3', weatherType);
        }else if (weatherType === 'дождь') {
            changeAudioSourceDirectly('raining.mp3', weatherType);
        }else if (weatherType === 'ясно') {
            changeAudioSourceDirectly('birds.mp3', weatherType);
        } 
        else if (weatherType === 'облачно с прояснениями') {
            changeAudioSourceDirectly('birds.mp3', weatherType);
        }

}
}
let lastWeather = 0
let weatherApp = new WeatherApp(0);

const ul1 = document.querySelector('li:nth-child(1)')
const ul2 = document.querySelector('li:nth-child(2)')
const ul3 = document.querySelector('li:nth-child(3)')
let opened = false;

function Wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
document.getElementById("setting-hover").addEventListener('click', async ()=>{
    if(opened === true){
        ul1.style.transform = 'translateX(-350px)';
        await Wait(50);
        ul2.style.transform = 'translateX(-350px)';
        await Wait(50);
        ul3.style.transform = 'translateX(-350px)';
        opened = false;
    }
    else{
        ul1.style.transform = 'translateX(0px)';
        await Wait(50);
        ul2.style.transform = 'translateX(0px)';
        await Wait(50);
        ul3.style.transform = 'translateX(0px)';
        opened = true;
    }
})

const powerSwitch = document.getElementById('powerSwitch');
        
powerSwitch.classList.remove('active');

const savedUnit = localStorage.getItem('temperatureUnit');
if (savedUnit === 'F') {
    powerSwitch.classList.add('active');
}

powerSwitch.addEventListener('click', function() {
    this.classList.toggle('active');
    this.style.animation = 'none';
    setTimeout(() => {
        this.style.animation = 'click 0.2s ease';
    }, 10);
    const isActive = this.classList.contains('active');
    
    if(isActive){
        weatherApp.updateTemperatureUnit('F');
    }
    else{
        weatherApp.updateTemperatureUnit('C');
    }
});

function setPowerState(state) {
    if (state) {
        powerSwitch.classList.add('active');
        weatherApp.updateTemperatureUnit('F');
    } else {
        powerSwitch.classList.remove('active');
        weatherApp.updateTemperatureUnit('C');
    }
}

function getPowerState() {
    return powerSwitch.classList.contains('active');
}


let firstColor = '#74b9ff';
let secondColor = '#0984e3';
let volume = 0.2; 
const firstColorInput = document.querySelector('.first-color');
const secondColorInput = document.querySelector('.second-color');
const rainSound = document.getElementById('rainSound');
const volumeSlider = document.getElementById('volumeSlider');

window.addEventListener('DOMContentLoaded', function(){
    const saved1 = localStorage.getItem('bgcolor1');
    const saved2 = localStorage.getItem('bgcolor2');
    
    if(saved1 && saved2){
        firstColor = saved1;
        secondColor = saved2;
        firstColorInput.value = firstColor;
        secondColorInput.value = secondColor;
    }
    
    updateGradient();

    const savedVolume = localStorage.getItem('volume');
    if(savedVolume !== null){
        volume = parseFloat(savedVolume);
        volumeSlider.value = volume * 100;
    } else {
        volume = 0.2;
        volumeSlider.value = 20; 
    }
    
    updateVolume();
    try {
        rainSound.volume = volume;
        const playPromise = rainSound.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log('Автозапуск музыки заблокирован. Пользователь должен запустить вручную.');
            });
        }
    } catch (error) {
        console.log('Ошибка воспроизведения звука:', error);
    }
});

function updateGradient() {
    document.body.style.background = `linear-gradient(135deg, ${firstColor} 0%, ${secondColor} 100%)`;
}

firstColorInput.addEventListener('input', function() {
    firstColor = this.value;
    localStorage.setItem('bgcolor1', firstColor);
    updateGradient();
});

secondColorInput.addEventListener('input', function() {
    secondColor = this.value;
    localStorage.setItem('bgcolor2', secondColor);
    updateGradient();
});

volumeSlider.addEventListener('input', () => {
    volume = volumeSlider.value / 100; 
    updateVolume();
    localStorage.setItem('volume', volume);

    if (rainSound.paused) {
        rainSound.play()
    }
});

function updateVolume() {
    rainSound.volume = volume;
}

document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        if (!rainSound.paused) {
            rainSound.pause();
        }
    } else {
        if (rainSound.currentTime > 0) {
            rainSound.play()
        }
    }
});

function changeAudioSourceDirectly(newSourcePath, weatherType) {
    if (weatherType !== lastWeather) {
        lastWeather = weatherType
        const currentTime = rainSound.currentTime;
        const wasPlaying = !rainSound.paused;
        const currentVolume = rainSound.volume;
        
        rainSound.src = newSourcePath;
        rainSound.volume = currentVolume;

        rainSound.addEventListener('canplay', function() {
            rainSound.currentTime = Math.min(currentTime, rainSound.duration || 0);
            if (wasPlaying) {
                rainSound.play().catch(error => {
                    console.log('Не удалось возобновить воспроизведение:', error);
                });
            }
        }, { once: true });
    }else{lastWeather = 0}
}