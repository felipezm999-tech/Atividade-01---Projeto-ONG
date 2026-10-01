const maskFormats = {
    cpf(digits) {
        return digits
            .slice(0, 11)
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2");
    },
    phone(digits) {
        const limited = digits.slice(0, 11);
        const areaCode = limited.slice(0, 2);
        const number = limited.slice(2);

        if (number.length === 0) return areaCode ? `(${areaCode}` : "";

        const prefixLength = limited.length > 10 ? 5 : 4;
        const prefix = number.slice(0, prefixLength);
        const suffix = number.slice(prefixLength);
        return `(${areaCode}) ${prefix}${suffix ? `-${suffix}` : ""}`;
    },
    cep(digits) {
        const limited = digits.slice(0, 8);
        return limited.length > 5
            ? `${limited.slice(0, 5)}-${limited.slice(5)}`
            : limited;
    },
};

document.querySelectorAll("[data-mask]").forEach((input) => {
    const format = maskFormats[input.dataset.mask];
    if (!format) return;

    input.addEventListener("input", () => {
        const digits = input.value.replace(/\D/g, "");
        input.value = format(digits);
    });
});

const birthDate = document.querySelector("#birth-date");
if (birthDate) {
    const today = new Date();
    const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60_000)
        .toISOString()
        .slice(0, 10);
    birthDate.max = localDate;
}

const registrationForm = document.querySelector("#registration-form");
const formStatus = document.querySelector("#form-status");

if (registrationForm && formStatus) {
    registrationForm.addEventListener("submit", (event) => {
        event.preventDefault();
        formStatus.textContent = "Cadastro validado. O envio ainda não está conectado a um sistema.";
    });
}