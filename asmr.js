    const axios = require("axios")
    const cheerio = require('cheerio')
    const fs = require("fs")
    const ids = fs.readFileSync('./asmr/ids.txt', 'utf8')
    let items = []
    var sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

//获取页面信息并根据id获取播放地址同时存储页面id
    async function getid(page) {
        let data = await get('http://asmrtd.com/asmr/page/' + page)
        let $ = cheerio.load(data)
        let list = $('.post-info')
        for (i = 0; i < list.length; i++) {
            id = list.eq(i).find('a').attr('href').match(/\d+/)[0]
            console.log(id)
            if (!ids.includes(id)) {
                let data = await getplayurl(id)
                if (data && data.title) {
                    fs.appendFileSync('./asmr/asmr.txt', `${data.title.replace(/,/g,"")},http://asmrtd.com${data.videos[0].url}\n`)
                    fs.appendFileSync('./asmr/ids.txt', `${id},`)
                    await sleep(500)
                }
            } else console.log("重复啦")
        }
    }

//开始爬取
    async function task() {
        let hdata = await get("http://asmrtd.com/asmr/page/1")
        const $1 = cheerio.load(hdata)
        page = $1("page-nav").attr("pages")
        console.log("共" + (parseInt(page) + 1) + "页")
        for (p = 1; p < (parseInt(page) + 1); p++) {
            console.log('第' + p + '页')
            await sleep(5000)
            await getid(p)
        }
    }

//获取播放地址
    async function getplayurl(id) {
        let data = await get(
            'http://asmrtd.com/wp-json/b2/v1/getPostVideos',
            'post',
            `post_id=${id}&order_id=null`
        )
        if (data) console.log(data.title)
        return data

    }

//get post请求返回数据 
    function get(url, method = 'get', data) {
        return new Promise(async resolve => {
            try {
                if (method == 'get') res = await axios.get(url)
                else res = await axios.post(url, data)
                resolve(res.data)
            } catch (err) {
                console.log(err)
            }
            resolve()
        })
    }


    task()