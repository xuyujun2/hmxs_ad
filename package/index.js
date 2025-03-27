const fs = require("fs");
const shell = require('shelljs');
const colors = require('colors');
const readline = require('readline');

const manifestContent = fs.readFileSync('../src/manifest.json', 'utf-8')

const { package: packageName, versionName } = JSON.parse(manifestContent)

const originPath = `./dist/${packageName}.release.${versionName}.rpk`

const normalPath = `./package/dist/${packageName}.release.${versionName}.normal.rpk`

const iconPath = `./package/dist/${packageName}.release.${versionName}.icon.rpk`

if (!fs.existsSync('./dist')) {
    fs.mkdirSync('./dist')
}

const statusString = shell.exec('git status').stdout

const modified = ~statusString.indexOf('修改：') || ~statusString.indexOf('modified：')

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('close', function(flag) {
    process.exit(0)
})

function modifiedHandle() {
    if (modified) {
        rl.question('文件有改动，确认打包？(输入 yes 进行打包)', (answer) => {
            if (answer === 'yes') {
                build()
            } else {
                console.log('打包失败！'.red)
                rl.close()
            }
        });
    } else {
        build()
    }
}

function build() {
    console.log('-----即将打包普通版本-----\n'.green)
    shell.cd('../')
    shell.exec('npm run release')
    setTimeout(() => {
        fs.copyFileSync(originPath, normalPath)
        console.log('\n-----普通版本打包完成-----\n'.green)
        console.log(('文件目录为: ' + normalPath + '\n').red)
        
        fs.unlinkSync('./src/Common/logo.png')
        fs.copyFileSync('./package/bak/blank/logo.png', './src/Common/logo.png')
        
        console.log('-----即将打包图标修改版-----\n'.green)
        shell.exec('npm run release')
        setTimeout(() => {
            fs.copyFileSync(originPath, iconPath)
            console.log('\n-----图标修改版打包完成-----\n'.green)
            console.log(('文件目录为: ' + iconPath + '\n').red)
            
            fs.unlinkSync('./src/Common/logo.png')
            fs.copyFileSync('./package/bak/free/logo.png', './src/Common/logo.png')
            
            shell.cd('./package')
            
            rl.close()
        }, 2000)
    }, 2000)
}

modifiedHandle()