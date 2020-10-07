enum EGender {
    male = 'm',
    female = 'w'
}

interface ICovid19Cases {
    _id: string;
    description: string;
    meldedatum: string,
    erkrankungsdatum: string,
    cases: number,
    deaths: number,
    recoverd: number,
    age: string,
    gender?: EGender
}


export {ICovid19Cases}
