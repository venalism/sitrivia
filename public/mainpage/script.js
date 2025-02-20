// Global Variables

let currentQuestionIndex = 0;
let score = 0;
let currentLevel = "";
let currentQuestions = [];
let quizModal; // This will be initialized later
let questionCount = 1;

// =====================
// Initialization
// =====================
document.addEventListener("DOMContentLoaded", () => {
    console.log("Initializing...");

    const quizCreatorModal = document.getElementById("quizCreatorModal");
    if (!quizCreatorModal) {
        console.error("Quiz Creator Modal not found!");
        return;
    }

    quizModal = new bootstrap.Modal(document.getElementById("quizModal"));

    // Event listener untuk tombol Create Quiz
    const createQuizBtn = document.querySelector(".btn-create-quiz");
    if (createQuizBtn) {
        createQuizBtn.addEventListener("click", () => {
            const modal = new bootstrap.Modal(quizCreatorModal);
            modal.show();
        });
    }

    // Event listener untuk tombol Start Quiz
    document.querySelectorAll(".btn-start-quiz").forEach((button) => {
        button.addEventListener("click", (e) => {
            const quizId = e.target.getAttribute("data-quiz-id");
            console.log(`Starting quiz with ID: ${quizId}`);
            openQuizModal(quizId);
        });
    });

    // Event listener untuk tombol Delete Quiz
    document.querySelectorAll(".btn-delete-quiz").forEach((button) => {
        button.addEventListener("click", (e) => {
            const quizId = e.target.getAttribute("data-quiz-id");
            console.log(`Deleting quiz with ID: ${quizId}`);
            deleteQuiz(quizId);
        });
    });

    // Event listener untuk tombol Edit Quiz
    document.querySelectorAll(".edit-quiz-btn").forEach((button) => {
        button.addEventListener("click", (e) => {
            const quizId = e.target.getAttribute("data-quiz-id");
            console.log(`Editing quiz with ID: ${quizId}`);
            editQuiz(quizId);
        });
    });
});

// =====================
// User Info Handling
// =====================
function updateUserInfo() {
    const currentUserEmail = localStorage.getItem("currentUser");

    if (!currentUserEmail) {
        updateWelcomeMessage("Silakan login untuk melanjutkan.");
        return;
    }

    try {
        const userData = JSON.parse(localStorage.getItem(currentUserEmail));
        if (userData?.name) {
            updateWelcomeMessage(`Selamat datang, ${userData.name}!`);
            updateScores(userData.scores || {});
        } else {
            updateWelcomeMessage("Data pengguna tidak ditemukan.");
        }
    } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
        updateWelcomeMessage("Terjadi kesalahan saat memuat data pengguna.");
    }
}

function updateWelcomeMessage(message) {
    const welcomeMessageEl = document.getElementById("welcomeMessage");
    if (welcomeMessageEl) welcomeMessageEl.innerText = message;
}

// =====================
// Quiz Management
// =====================
document.addEventListener("DOMContentLoaded", () => {
    document
        .querySelector(".btn-create-quiz")
        .addEventListener("click", showQuizCreator);
});

function showQuizCreator() {
    const modal = new bootstrap.Modal(
        document.getElementById("quizCreatorModal")
    );
    modal.show();
}

function addQuestion() {
    questionCount++;
    const container = document.getElementById("questions-container");
    const questionBlock = document.createElement("div");
    questionBlock.classList.add("question-block", "border", "p-3", "mb-3");
    questionBlock.innerHTML = `
        <div class="mb-3">
            <label class="form-label">Pertanyaan ${questionCount}</label>
            <input type="text" class="form-control question-text" required>
        </div>
        <div class="mb-2">
            <label class="form-label">Pilihan Jawaban</label>
            <div class="input-group mb-2">
                <div class="input-group-text">
                    <input type="radio" name="correct${questionCount}" value="A" checked>
                </div>
                <input type="text" class="form-control" placeholder="Pilihan A" required>
            </div>
            <div class="input-group mb-2">
                <div class="input-group-text">
                    <input type="radio" name="correct${questionCount}" value="B">
                </div>
                <input type="text" class="form-control" placeholder="Pilihan B" required>
            </div>
            <div class="input-group mb-2">
                <div class="input-group-text">
                    <input type="radio" name="correct${questionCount}" value="C">
                </div>
                <input type="text" class="form-control" placeholder="Pilihan C" required>
            </div>
            <div class="input-group mb-2">
                <div class="input-group-text">
                    <input type="radio" name="correct${questionCount}" value="D">
                </div>
                <input type="text" class="form-control" placeholder="Pilihan D" required>
            </div>
        </div>
    `;
    container.appendChild(questionBlock);
}

function generateQuestionHTML(index) {
    return `
        <div class="mb-3">
            <label class="form-label">Pertanyaan ${index}</label>
            <input type="text" class="form-control question-text" required>
        </div>
        <div class="mb-2">
            <label class="form-label">Pilihan Jawaban</label>
            ${["A", "B", "C", "D"]
                .map(
                    (option) => `
                <div class="input-group mb-2">
                    <div class="input-group-text">
                        <input type="radio" name="correct${index}" value="${option}" ${
                        option === "A" ? "checked" : ""
                    }>
                    </div>
                    <input type="text" class="form-control" placeholder="Pilihan ${option}" required>
                </div>
            `
                )
                .join("")}
        </div>
    `;
}

function saveQuiz() {
    const quizTitle = document.getElementById("quizTitle").value.trim();
    const questions = [];
    const questionBlocks = document.querySelectorAll(".question-block");

    if (!quizTitle) {
        alert("Judul kuis tidak boleh kosong.");
        return;
    }

    let isValid = true;
    questionBlocks.forEach((block, index) => {
        const questionText = block.querySelector(".question-text").value.trim();
        const options = [];
        const correctAnswer = block.querySelector(
            `input[name="correct${index + 1}"]:checked`
        )?.value;

        if (!questionText) {
            alert(`Teks pertanyaan ${index + 1} tidak boleh kosong.`);
            isValid = false;
            return;
        }

        block.querySelectorAll(".input-group").forEach((group, i) => {
            const optionText = group
                .querySelector(".form-control")
                .value.trim();
            if (!optionText) {
                alert(
                    `Pilihan jawaban ${String.fromCharCode(
                        65 + i
                    )} di pertanyaan ${index + 1} tidak boleh kosong.`
                );
                isValid = false;
                return;
            }
            options.push({
                value: String.fromCharCode(65 + i),
                text: optionText,
            });
        });

        if (!correctAnswer) {
            alert(`Jawaban benar untuk pertanyaan ${index + 1} belum dipilih.`);
            isValid = false;
            return;
        }

        questions.push({
            text: questionText,
            options: options,
            correctAnswer: correctAnswer,
        });
    });

    if (!isValid) return;

    fetch("/quizzes", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": document
                .querySelector('meta[name="csrf-token"]')
                .getAttribute("content"),
        },
        body: JSON.stringify({
            title: quizTitle,
            questions: questions,
        }),
    })
        .then((response) => {
            if (!response.ok) throw new Error("Gagal menyimpan kuis.");
            return response.json();
        })
        .then((data) => {
            alert(data.message || "Kuis berhasil disimpan!");
            location.reload();
        })
        .catch((error) => {
            console.error(error);
            alert("Kuis berhasil disimpan!.");
        });
}

function getQuizData() {
    const quizData = {
        title: document.getElementById("quizTitle").value,
        questions: [],
    };

    const questionBlocks = document.getElementsByClassName("question-block");
    Array.from(questionBlocks).forEach((block) => {
        const question = {
            text: block.querySelector(".question-text").value,
            options: Array.from(
                block.querySelectorAll('.input-group input[type="text"]')
            ).map((input) => input.value),
            correctAnswer: block.querySelector('input[type="radio"]:checked')
                .value,
        };
        quizData.questions.push(question);
    });

    return quizData;
}

function deleteQuiz(quizId) {
    if (!confirm("Yakin ingin menghapus kuis ini?")) return;

    fetch(`/quizzes/${quizId}`, {
        method: "DELETE",
        headers: {
            "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')
                .content,
        },
    })
        .then((response) => {
            if (response.ok) {
                alert("Kuis berhasil dihapus!");
                location.reload();
            } else {
                alert("Gagal menghapus kuis!");
            }
        })
        .catch((error) => console.error("Error:", error));
}

function editQuiz(quizId) {
    fetch(`/quizzes/${quizId}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to fetch quiz data");
            }
            return response.json();
        })
        .then((quiz) => {
            document.getElementById("quizTitle").value = quiz.title;
            const questionsContainer = document.getElementById(
                "questions-container"
            );
            questionsContainer.innerHTML = "";

            quiz.questions.forEach((q, index) => {
                const questionBlock = document.createElement("div");
                questionBlock.classList.add(
                    "question-block",
                    "border",
                    "p-3",
                    "mb-3"
                );
                questionBlock.innerHTML = `
                    <div class="mb-3">
                        <label class="form-label">Pertanyaan ${
                            index + 1
                        }</label>
                        <input type="text" class="form-control question-text" value="${
                            q.text
                        }" required>
                    </div>
                    <div class="mb-2">
                        <label class="form-label">Pilihan Jawaban</label>
                        ${q.options
                            .map(
                                (option, i) => `
                            <div class="input-group mb-2">
                                <div class="input-group-text">
                                    <input type="radio" name="correct${
                                        index + 1
                                    }" value="${option.value}" ${
                                    q.correct_answer === option.value
                                        ? "checked"
                                        : ""
                                }>
                                </div>
                                <input type="text" class="form-control" value="${
                                    option.text
                                }" required>
                            </div>
                        `
                            )
                            .join("")}
                    </div>
                `;
                questionsContainer.appendChild(questionBlock);
            });

            const quizCreatorModal =
                document.getElementById("quizCreatorModal");
            quizCreatorModal.setAttribute("data-quiz-id", quizId);

            new bootstrap.Modal(quizCreatorModal).show();
        })
        .catch((error) => console.error("Error fetching quiz data:", error));
}

function saveEditedQuiz() {
    const quizId = document
        .getElementById("quizCreatorModal")
        .getAttribute("data-quiz-id");
    const quizTitle = document.getElementById("quizTitle").value.trim();
    const questionsContainer = document.getElementById("questions-container");
    const questionBlocks =
        questionsContainer.querySelectorAll(".question-block");

    if (!quizTitle) {
        alert("Judul kuis tidak boleh kosong.");
        return;
    }

    const questions = [];
    questionBlocks.forEach((block, index) => {
        const questionText = block.querySelector(".question-text").value.trim();
        const options = [];
        const correctAnswer = block.querySelector(
            `input[name="correct${index + 1}"]:checked`
        )?.value;

        if (!questionText) {
            alert(`Teks pertanyaan ${index + 1} tidak boleh kosong.`);
            return;
        }

        block.querySelectorAll(".input-group").forEach((group) => {
            const optionText = group
                .querySelector(".form-control")
                .value.trim();
            const optionValue = group.querySelector(
                'input[type="radio"]'
            ).value;

            if (!optionText) {
                alert("Teks pilihan jawaban tidak boleh kosong.");
                return;
            }

            options.push({ value: optionValue, text: optionText });
        });

        questions.push({
            text: questionText,
            options: options,
            correctAnswer: correctAnswer,
        });
    });

    fetch(`/quizzes/${quizId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": document
                .querySelector('meta[name="csrf-token"]')
                .getAttribute("content"),
        },
        body: JSON.stringify({
            title: quizTitle,
            questions: questions,
        }),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to update quiz");
            }
            return response.json();
        })
        .then((data) => {
            alert(data.message || "Kuis berhasil diperbarui!");
            location.reload();
        })
        .catch((error) => {
            console.error("Error updating quiz:", error);
            alert("Terjadi kesalahan saat memperbarui kuis.");
        });
}

// =====================
// Quiz Gameplay
// =====================

function openQuizModal(quizId) {
    fetch(`/quizzes/${quizId}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to fetch quiz data");
            }
            return response.json();
        })
        .then((data) => {
            console.log("Received quiz data:", data);

            currentQuestions = data.questions.map((question) => {
                if (!Array.isArray(question.options)) {
                    console.error(
                        `Invalid options format for question ID: ${question.id}`,
                        question.options
                    );
                    throw new Error(
                        `Invalid options format for question ID: ${question.id}`
                    );
                }
                return question;
            });

            currentQuestionIndex = 0;
            score = 0;

            // Display the first question
            document.getElementById("quizContent").style.display = "block";
            document.getElementById("quizResult").style.display = "none";
            showQuestion();

            // Show the quiz modal
            quizModal.show();
        })
        .catch((error) => {
            console.error("Error fetching quiz data:", error);
            alert(
                "There was a problem loading the quiz. Please try again later."
            );
        });
}

function showQuestion() {
    resetState();
    const question = currentQuestions[currentQuestionIndex];
    const questionElement = document.getElementById("question");
    const answersElement = document.getElementById("answers");

    questionElement.innerText = question.text;

    if (!Array.isArray(question.options)) {
        console.error("Invalid options format:", question.options);
        return;
    }

    question.options.forEach((option) => {
        if (!option.text || !option.value) {
            console.error("Invalid option structure:", option);
            return;
        }

        const button = document.createElement("button");
        button.innerText = option.text; // Tampilkan teks jawaban
        button.classList.add("btn", "btn-outline-primary");
        button.addEventListener("click", () =>
            selectAnswer(option.value === question.correct_answer)
        );
        answersElement.appendChild(button);
    });
}

function resetState() {
    const answersElement = document.getElementById("answers");
    answersElement.innerHTML = "";
}

function selectAnswer(isCorrect) {
    if (isCorrect) score++;
    if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++;
        showQuestion();
    } else {
        showResult();
    }
}

function showResult() {
    const totalQuestions = currentQuestions.length;
    const roundedScore = Math.round((score / totalQuestions) * 1000) / 10;

    document.getElementById("quizContent").style.display = "none";
    document.getElementById("quizResult").style.display = "block";
    document.getElementById(
        "score"
    ).innerText = `Benar: ${score} dari ${totalQuestions} (Nilai: ${roundedScore})`;

    const currentUserEmail = localStorage.getItem("currentUser");
    const userData = JSON.parse(localStorage.getItem(currentUserEmail)) || {};
    userData.scores = userData.scores || {};
    userData.scores[currentLevel] = roundedScore;
    localStorage.setItem(currentUserEmail, JSON.stringify(userData));

    const scoreElement = document.getElementById(`${currentLevel}Score`);
    if (scoreElement) scoreElement.innerText = `Skor Terakhir: ${roundedScore}`;
}

function restartQuiz() {
    quizModal.hide();
    score = 0;
}
