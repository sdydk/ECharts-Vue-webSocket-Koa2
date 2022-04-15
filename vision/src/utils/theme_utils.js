const theme = {
    chalk: {
        backgroundColor: '#161522',
        titleColor: '#ffffff',
        logoSrc: 'logo_dark.png',
        themeSrc: 'qiehuan_dark.png',
        handerBorderSrc: 'header_border_dark.png',
    },
    vintage: {
        backgroundColor: '#ffffff',
        titleColor: '#000000',
        logoSrc: 'logo_light2.png',
        themeSrc: 'qiehuan_light.png',
        handerBorderSrc: 'header_border_light.png',
    },
}

export function getThemeValue(themeName) {
    return theme[themeName]
}