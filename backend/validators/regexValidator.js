

function validateEmail(email) {

    const emailPattern =
        /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    return emailPattern.test(email);
}


function validateURL(url) {

    const urlPattern =
        /^\/[A-Za-z0-9/_-]*$/;

    return urlPattern.test(url);
}


module.exports = {
    validateEmail,
    validateURL
};
