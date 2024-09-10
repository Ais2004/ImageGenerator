document.addEventListener("DOMContentLoaded", () => {
  const apiKey = 'koOmQEpAr8ko7ATpe4NnTx0bbsUaZVZc920DuQJUqg5r8IGYR6087dPX'; // Replace with your actual Pexels API key
  const imageContainer = document.querySelector('.images');
  const loadMoreBtn = document.querySelector('.load_more');
  const searchImg = document.getElementById('searchQuery');
  const recentSearch = document.querySelector('.recent-search');
  const delAll = document.querySelector('.del_all');
  const imgBtn = document.querySelector('.img');
  const vdoBtn = document.querySelector('.vdo');
  let currentPage = 1;
  let userSearch = null;
  let recentArr = [];
  let searchType = 'photos'; // Default to photos

  // Save recent searches to local storage
  const setLocalStorage = () => {
    localStorage.setItem('recent', JSON.stringify(recentArr));
  };

  // Load recent searches from local storage
  const getLocalStorage = () => {
    const localRecent = JSON.parse(localStorage.getItem('recent'));
    if (!localRecent) return;
    recentArr = localRecent;
    if (recentArr.length > 0) {
      delAll.classList.remove('hidden');
      //renderRecentArray();
    }
  };

  // Render images or videos to the page
  const renderContent = (items) => {
    if (items.length === 0) {
      const html = `<p>No results found. Please try a different search term.</p>`;
      imageContainer.innerHTML = html;
      return;
    }
    items.forEach(item => {
      let html;
      if (searchType === 'photos') {
        html = `
          <li class="card">
            <img src="${item.src.large2x}" alt="${item.alt}" />
            <div class="details hidden">
              <div class="description">
                <i class="fa-solid fa-circle-info"></i>
                <span>${item.alt}</span>
              </div>
              <button onclick="download('${item.src.large2x}')">
                <i class="fa-solid fa-download"></i>
              </button>
            </div>
          </li>
        `;
      } else if (searchType === 'videos') {
        html = `
          <li class="card">
            <video controls>
              <source src="${item.video_files[0].link}" type="video/mp4">
              Your browser does not support the video tag.
            </video>
            <div class="details hidden">
              <div class="description">
                <i class="fa-solid fa-circle-info"></i>
                <span>${item.user.name}</span>
              </div>
              <button onclick="download('${item.video_files[0].link}')">
                <i class="fa-solid fa-download"></i>
              </button>
            </div>
          </li>
        `;
      }
      imageContainer.insertAdjacentHTML('beforeend', html);
    });
  };

  // Download image or video
  const download = (url) => {
    fetch(url)
      .then(response => response.blob())
      .then(file => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(file);
        a.download = new Date().getTime();
        a.click();
      })
      .catch(() => alert('Unable to download file'));
  };

  // Fetch images or videos from the Pexels API
  const getContent = (URL) => {
    loadMoreBtn.textContent = 'Loading...';
    loadMoreBtn.classList.add('disabled');
    fetch(URL, {
      headers: {
        Authorization: apiKey,
      },
    })
      .then(response => response.json())
      .then(data => {
        if (searchType === 'photos') {
          renderContent(data.photos);
        } else if (searchType === 'videos') {
          renderContent(data.videos);
        }
        loadMoreBtn.textContent = 'Load More';
        loadMoreBtn.classList.remove('disabled');
      })
      .catch(() => alert('Failed to load content'));
  };

  // Load more images or videos
  const loadMoreContent = () => {
    currentPage++;
    let apiURL = `https://api.pexels.com/v1/curated?page=${currentPage}&per_page=15`;
    if (userSearch) {
      apiURL = `https://api.pexels.com/v1/search?query=${userSearch}&page=${currentPage}&per_page=15`;
      if (searchType === 'videos') {
        apiURL = `https://api.pexels.com/videos/search?query=${userSearch}&page=${currentPage}&per_page=15`;
      }
    }
    getContent(apiURL);
  };

  // Get URL based on search content
  const getURL = (content) => {
    currentPage = 1; // Reset to the first page of results
    let apiURL = `https://api.pexels.com/v1/search?query=${content}&page=${currentPage}&per_page=15`;
    if (searchType === 'videos') {
      apiURL = `https://api.pexels.com/videos/search?query=${content}&page=${currentPage}&per_page=15`;
    }
    getContent(apiURL);
  };

  // Render recent searches
  const renderRecentArray = () => {
    recentSearch.innerHTML = '';
    recentArr.forEach(ele => {
      const html = `<button class="recent">${ele}</button>`;
      recentSearch.insertAdjacentHTML('afterbegin', html);
    });
  };

  // Add search to recent searches
  const pushRecent = (content) => {
    if (recentArr.includes(content)) return;
    if (recentArr.length === 5) {
      recentArr.shift();
    }
    recentArr.push(content);
    setLocalStorage();
    renderRecentArray();
  };

  // Handle search input
  const loadSearchImg = (e) => {
    if (e.key === 'Enter') {
      if (e.target.value.trim() === '') {
        imageContainer.innerHTML = '';
        userSearch = null;
        return loadMoreContent();
      }
      userSearch = searchImg.value.trim();
      imageContainer.innerHTML = '';
      pushRecent(userSearch);
      getURL(userSearch);
    }
  };

  // Load initial curated content
  getContent(`https://api.pexels.com/v1/curated?page=${currentPage}&per_page=15`);

  // Event listeners
  loadMoreBtn.addEventListener('click', loadMoreContent);
  searchImg.addEventListener('keyup', loadSearchImg);
  recentSearch.addEventListener('click', (e) => {
    const recSea = e.target.closest('.recent');
    if (!recSea) return;
    imageContainer.innerHTML = '';
    searchImg.value = e.target.textContent;
    userSearch = e.target.textContent;
    getURL(e.target.textContent);
  });
  delAll.addEventListener('click', () => {
    recentArr = [];
    setLocalStorage();
    renderRecentArray();
    delAll.classList.add('hidden');
  });
  imgBtn.addEventListener('click', () => {
    searchType = 'photos';
    imageContainer.innerHTML = '';
    if (userSearch) {
      getURL(userSearch);
    } else {
      getContent(`https://api.pexels.com/v1/curated?page=${currentPage}&per_page=15`);
    }
  });
  vdoBtn.addEventListener('click', () => {
    searchType = 'videos';
    imageContainer.innerHTML = '';
    if (userSearch) {
      getURL(userSearch);
    } else {
      getContent(`https://api.pexels.com/videos/popular?page=${currentPage}&per_page=15`);
    }
  });

  // Load recent searches from local storage on page load
  getLocalStorage();
});
