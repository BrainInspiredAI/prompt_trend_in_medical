// 读取Excel文件并绘制图表
function renderChart(data) {
    // 使用 Map 来存储每天的论文数量
    const countsByDate = new Map()
    for (let i = 0; i < data.length; i++) {
        const row = data[i]
        const date = row[1]
        const count = countsByDate.get(date) || 0
        countsByDate.set(date, count + 1)
    }

    // 将 Map 转换为两个数组：日期和论文数量
    const dates = Array.from(countsByDate.keys())
    const countsByDateArray = dates.map(date => countsByDate.get(date))
    const counts = dates.map(date => countsByDate.get(date))

    const cumulativeCounts = counts.reduce((acc, val) => {
        acc.push(acc.length === 0 ? val : acc[acc.length - 1] + val)
        return acc
    }, [])
    console.log(cumulativeCounts)

    // 获取页面元素和上下文
    const canvas1 = document.getElementById('chart1')
    const context1 = canvas1.getContext('2d')

    const canvas2 = document.getElementById('chart2')
    const context2 = canvas2.getContext('2d')

    // 设置图表的样式和数据
    const chart1 = new Chart(context1, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [{
                label: 'Paper Submissions Per Day',
                data: counts,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    })

    const chart2 = new Chart(context2, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Cumulative Paper Submissions',
                data: cumulativeCounts,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes :[{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    })

    // 监听日期条的拖动事件
    const dateRange1 = document.getElementById('date-range1')
    const dateDisplay1 = document.getElementById('date-display1')

    const dateRange2 = document.getElementById('date-range2')
    const dateDisplay2 = document.getElementById('date-display2')

    dateRange1.addEventListener('input', event => {
        const index = event.target.value - 1
        const selectedDate = dates[index]
        dateDisplay1.textContent = selectedDate

        chart1.data.datasets[0].data = countsByDateArray.slice(0, index + 1)
        chart1.update()
    })

    dateRange2.addEventListener('input', event => {
        const index = event.target.value - 1
        const selectedDate = dates[index]
        dateDisplay2.textContent = selectedDate

        chart2.data.datasets[0].data = cumulativeCounts.slice(0, index + 1)
        chart2.update()
    })
    
    // 动态计算进度条的值
    const rangeMax = dates.length
    const rangeStep = 1
    dateRange1.setAttribute('max', rangeMax)
    dateRange1.setAttribute('step', rangeStep)
    dateRange1.value = rangeMax

    dateRange2.setAttribute('max', rangeMax)
    dateRange2.setAttribute('step', rangeStep)
    dateRange2.value = rangeMax
}

function renderYearlyChart(data) {
    const countsByYear = new Map()

    for(const row of data) {
        const dateStr = row[1].toString();
        const year = parseInt(dateStr.substring(0, 4));
        countsByYear.set(year, (countsByYear.get(year) || 0) + 1)
    }

    const years = Array.from(countsByYear.keys())
    const countsByYearArray = years.map(year => countsByYear.get(year))
    
    const canvas = document.getElementById('yearly-chart')
    const context = canvas.getContext('2d')

    const chart = new Chart(context, {
        type : 'bar',
        data: {
            labels: years,
            datasets: [{
                label: 'Paper Submissions Per Year',
                data: countsByYearArray,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes :[{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    })

}

// 读取Excel文件
function readExcelFile(url) {
    const request = new XMLHttpRequest()
    request.open('GET', url, true)
    request.responseType = 'arraybuffer'

    request.onload = function() {
        const data = new Uint8Array(request.response)
        const workbook = XLSX.read(data, {type: 'array'})
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const range = XLSX.utils.decode_range(sheet['!ref'])
        const rows = []
        for (let i = range.s.r + 1; i <= range.e.r; i++) {
            const row = []
            for (let j = range.s.c; j <= range.e.c; j++) {
                const cell = sheet[XLSX.utils.encode_cell({r: i, c: j})]
                row.push(cell ? cell.v : undefined)
            }
            rows.push(row)
        }
        renderChart(rows)
        renderYearlyChart(rows)
    }
    request.send()
}

// 读取Excel文件并生成图表
readExcelFile('articles_info.xlsx')