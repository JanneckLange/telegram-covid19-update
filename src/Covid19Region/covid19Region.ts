interface ICovid19RegionData {
    id: string // RS
    last_update: string // last_update
    name: string // GEN
    einwohner: number // EWZ
    cases7_per_100k: number // cases7_per_100k
    cases: number // cases
    deaths: number // deaths
}

interface ICovid19Region {
    id: string // RS
    name: string // GEN
    bundesland: string, // BL
    bundeslandId: string // BL_ID
    county: string // county
    geometry: Array<Array<[number, number]>>
}


export {ICovid19RegionData, ICovid19Region}
