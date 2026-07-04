/**
 * Realiza un fetch enviando automáticamente la cookie HttpOnly de sesión.
 * El token ya no se guarda en el front: viaja en la cookie "token" que el
 * navegador adjunta gracias a credentials: "include".
 * Usarlo en cualquier endpoint protegido del backend.
 */
const fetchConAuth = async (url, options = {}) => {
    const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    return response;
};

export default fetchConAuth;
