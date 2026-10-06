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

const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");

if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
        const isOpen = navToggle.getAttribute("aria-expanded") === "true";
        navToggle.setAttribute("aria-expanded", String(!isOpen));
        navToggle.setAttribute("aria-label", isOpen ? "Abrir menu" : "Fechar menu");
        siteNav.classList.toggle("is-open", !isOpen);
    });

    siteNav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            navToggle.setAttribute("aria-expanded", "false");
            navToggle.setAttribute("aria-label", "Abrir menu");
            siteNav.classList.remove("is-open");
        });
    });
}

const registrationForm = document.querySelector("#registration-form");
const formStatus = document.querySelector("#form-status");

if (registrationForm && formStatus) {
    const interest = new URLSearchParams(window.location.search).get("interesse");
    const interestField = document.querySelector("#interest");
    if (interestField && interest && ["voluntariado", "doacao", "parceria", "noticias"].includes(interest)) {
        interestField.value = interest;
    }

    registrationForm.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!registrationForm.checkValidity()) {
            formStatus.textContent = "Revise os campos obrigatórios antes de enviar.";
            formStatus.setAttribute("data-state", "error");
            registrationForm.reportValidity();
            return;
        }

        const formData = new FormData(registrationForm);
        const participant = Object.fromEntries(formData.entries());
        const registrations = JSON.parse(localStorage.getItem("ong-raizes-cadastros") || "[]");

        if (registrations.some((item) => item.email === participant.email)) {
            formStatus.textContent = "Este e-mail já está cadastrado. Tente outro endereço.";
            formStatus.setAttribute("data-state", "error");
            return;
        }

        registrations.push({
            ...participant,
            cadastradoEm: new Date().toISOString(),
        });

        localStorage.setItem("ong-raizes-cadastros", JSON.stringify(registrations));
        formStatus.textContent = "Cadastro realizado com sucesso! Em breve nossa equipe entrará em contato.";
        formStatus.setAttribute("data-state", "success");
        registrationForm.reset();
    });
}

const experienceSection = document.querySelector(".experience-section");
if (experienceSection) {
    const experienceItems = [...document.querySelectorAll(".experience-copy-item")];
    const experienceVideos = [...document.querySelectorAll(".experience-visual-item")];
    const sticky = document.querySelector(".experience-sticky");

    const updateExperience = () => {
        const sectionTop = experienceSection.offsetTop;
        const scrollRange = Math.max(1, experienceSection.offsetHeight - window.innerHeight);
        const scrollProgress = Math.max(0, Math.min((window.scrollY - sectionTop) / scrollRange, 1));
        const index = Math.min(experienceItems.length - 1, Math.floor(scrollProgress * experienceItems.length));

        experienceItems.forEach((item, itemIndex) => {
            item.classList.toggle("is-active", index === itemIndex);
        });
        experienceVideos.forEach((item, itemIndex) => {
            item.classList.toggle("is-active", index === itemIndex);
        });

        if (sticky) {
            sticky.style.transform = `translateY(${Math.min(18, scrollProgress * 18)}px)`;
        }
    };

    let ticking = false;
    const handleScroll = () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateExperience();
                ticking = false;
            });
            ticking = true;
        }
    };

    updateExperience();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateExperience);
}
