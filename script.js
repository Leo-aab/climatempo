document.addEventListener('DOMContentLoaded', function() {  //funcao pra atualizar o footer
    
    document.getElementById('current-year').textContent = new Date().getFullYear();
    

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = new Date().toLocaleDateString('pt-BR', options);
    

    document.getElementById('search-btn').addEventListener('click', searchWeather);
    document.getElementById('city-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchWeather();
        }
    });
});

async function searchWeather() {
    const cityInput = document.getElementById('city-input');
    const city = cityInput.value.trim();
    
    if (!city) {
        alert("Por favor, digite o nome de uma cidade.");
        return;
    }
    
    try {
        // busca coordenadas da cidade
        const coords = await getCityCoordinates(city);
        
        // busca dados do tempo
        const weatherData = await getWeatherData(coords.lat, coords.lon);
        
        // exibe os dados
        displayWeather(city, weatherData);
    } catch (error) {
        console.error("Erro ao buscar dados:", error);
        alert("Erro ao buscar dados. Verifique o nome da cidade e tente novamente.");
    }
}

async function getCityCoordinates(city) {
    const proxyUTL= 'https://cors-anywhere.herokuapp.com/';
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.length === 0) {
        throw new Error("Cidade não encontrada");
    }
    
    return {
        lat: data[0].lat,
        lon: data[0].lon
    };
}

async function getWeatherData(lat, lon) {
    const proxyUTL= 'https://cors-anywhere.herokuapp.com/';
    const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`;
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'ClimaTempoApp/1.0 (seu@email.com)'
        }
    });
    const data = await response.json();
    
    // pega os dados atuais (primeiro intervalo de tempo)
    const current = data.properties.timeseries[0].data.instant.details;
    
    //retorna os dados atuais
    return {
        temperature: current.air_temperature,
        humidity: current.relative_humidity,
        windSpeed: current.wind_speed,
        feelsLike: current.air_temperature,
        description: getWeatherDescription(data)
    };
}

function getWeatherDescription(data) {
    // tenta obter a descrição do tempo do próximo intervalo
    const nextHour = data.properties.timeseries[0].data.next_1_hours;
    return nextHour ? nextHour.summary.symbol_code : 'desconhecido';
}


//atualizacao do icone
function displayWeather(city, weather) {
    document.getElementById('city-name').textContent = city;
    document.getElementById('temperature').textContent = `${Math.round(weather.temperature)}°C`;
    document.getElementById('description').textContent = weather.description;
    document.getElementById('humidity').textContent = `${weather.humidity}%`;
    document.getElementById('wind-speed').textContent = `${weather.windSpeed} m/s`;
    document.getElementById('feels-like').textContent = `${Math.round(weather.feelsLike)}°C`;
  
    const weatherIcon = document.querySelector('.weather-icon i');
    weatherIcon.className = getWeatherIcon(weather.description);
}

function getWeatherIcon(description) {
    const iconMap = {
        'clear': 'fas fa-sun',
        'cloudy': 'fas fa-cloud',
        'rain': 'fas fa-cloud-rain',
        'snow': 'fas fa-snowflake',
        'thunder': 'fas fa-bolt',
        'fog': 'fas fa-smog',
        'wind': 'fas fa-wind'
    };
    
    // verifica se a descrição contém alguma palavra-chave
    const desc = description.toLowerCase();
    if (desc.includes('clear') || desc.includes('sun')) return iconMap.clear;
    if (desc.includes('cloud')) return iconMap.cloudy;
    if (desc.includes('rain')) return iconMap.rain;
    if (desc.includes('snow')) return iconMap.snow;
    if (desc.includes('thunder')) return iconMap.thunder;
    if (desc.includes('fog') || desc.includes('mist')) return iconMap.fog;
    if (desc.includes('wind')) return iconMap.wind;
    
    return 'fas fa-question';
}
