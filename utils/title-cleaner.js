// graciously adapted from:
// https://github.com/jansmolders86/mediacenterjs/blob/master/lib/utils/title-cleaner.js
const YEAR_REGEX = /(19|20)\d{2}/g

module.exports.cleanupTitle = function(title) {
    var cleanTitle = title
    cleanTitle = removeIllegalCharacters(cleanTitle, ' ')
    cleanTitle = fixInitialSpacing(cleanTitle)
    cleanTitle = removeFileExtension(cleanTitle)
    cleanTitle = removeYear(cleanTitle)
    cleanTitle = removeReleaseGroups(cleanTitle)
    cleanTitle = removeMovieType(cleanTitle)
    cleanTitle = removeAudioType(cleanTitle)
    cleanTitle = removeLanguage(cleanTitle)
    
    // extract year from title
    var year = title.match(YEAR_REGEX)
    year = year ? year.toString() : ''

    return { title: cleanTitle.trim(), year: year.trim() }
}

removeIllegalCharacters = function(title, replacement) {
    return title.replace(/\.|_|\/|\+|\-/g, replacement)
}

removeYear = function(title) {
    return title.replace(YEAR_REGEX, '').replace(/\(|\)/g, '')
}

removeReleaseGroups = function(title) {
    return title.replace(
		/FxM|aAF|arc|AAC|MLR|AFO|TBFA|WB|JYK|ARAXIAL|UNiVERSAL|ETRG|ToZoon|PFa|SiRiUS|Rets|BestDivX|DIMENSION|CTU|ORENJI|LOL|juggs|NeDiVx|ESPiSE|MiLLENiUM|iMMORTALS|QiM|QuidaM|COCAiN|DOMiNO|JBW|LRC|WPi|NTi|SiNK|HLS|HNR|iKA|LPD|DMT|DvF|IMBT|LMG|DiAMOND|DoNE|D0PE|NEPTUNE|TC|SAPHiRE|PUKKA|FiCO|PAL|aXXo|VoMiT|ViTE|ALLiANCE|mVs|XanaX|FLAiTE|PREVAiL|CAMERA|VH-PROD|BrG|replica|FZERO|YIFY|MarGe|T4P3|MIRCrew|BOKUTOX|NAHOM|BLUWORLD|C0P|TRL/g,
    '');
}

removeMovieType = function(title) {
    return title.replace(
		/dvdrip|multi9|xxx|x264|x265|AC3|web|hdtv|vhs|HC|embeded|embedded|ac3|dd5 1|m sub|x264|dvd5|dvd9|multi sub|non|h264|x264| sub|subs|ntsc|ingebakken|torrent|torrentz|bluray|brrip|sample|xvid|cam|camrip|wp|workprint|telecine|ppv|ppvrip|scr|screener|dvdscr|bdscr|ddc|R5|telesync|pdvd|1080p|BDRIP|hq|sd|720p|hdrip/gi,
    '');
}

removeAudioType = function(title) {
    return title.replace(/320kbps|192kbps|128kbps|mp3|320|192|128/gi, '');
}

removeLanguage = function(title) {
    return title.replace(
		/\b(NL|SWE|SWESUB|ENG|JAP|BRAZIL|TURKIC|slavic|SLK|ITA|HEBREW|HEB|ESP|RUS|DE|german|french|FR|ESPA|dansk|HUN|iTALiAN|JPN|[Ii]ta|[Ee]ng)\b/g,
    '');
}

fixInitialSpacing = function(title) {
    // fixes spacing that occures between initials after removeIllegalCharacters()
    // jshint ignore:start
    return title.replace(/(?<=\b\w)\s(?=\w\b)/g, '')
    // jshint ignore:end
}

removeFileExtension = function(title) {
    return title.replace(/mkv|mp4|wmv|mov/, '')
}