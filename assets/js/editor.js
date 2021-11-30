const select = (el, all = false) => {
    el = el.trim()
    if (all) {
        return [...document.querySelectorAll(el)]
    } else {
        return document.querySelector(el)
    }
}

const download = (data, filename) => {
    // data is the string type, that contains the contents of the file.
    // filename is the default file name, some browsers allow the user to change this during the save dialog.

    // Note that we use octet/stream as the mimetype
    // this is to prevent some browsers from displaying the 
    // contents in another browser tab instead of downloading the file
    var blob = new Blob([data], {
        type: 'octet/stream'
    });

    //IE 10+
    if (window.navigator.msSaveBlob) {
        window.navigator.msSaveBlob(blob, filename);
    } else {
        //Everything else
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement('a');
        document.body.appendChild(a);
        a.href = url;
        a.download = filename;

        setTimeout(() => {
            //setTimeout hack is required for older versions of Safari

            a.click();

            //Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }, 1);
    }
}

const getParent = (element, selector) => {
    while (element.parentElement) {
        if (element.parentElement.matches(selector)) {
            return element.parentElement;
        }
        element = element.parentElement;
    }
}

(async () => {
    /**
     * Easy selector helper function
     */


    /**
     * Easy event listener function
     */
    const on = (type, el, listener, all = false) => {
        let selectEl = select(el, all)
        if (selectEl) {
            if (all) {
                selectEl.forEach(e => e.addEventListener(type, listener))
            } else {
                selectEl.addEventListener(type, listener)
            }
        }
    }


    const RESUME_STORAGE_KEY = "RESUME";
    const inputAva = select("input#profile-img");
    const inputProfile = select("input#about-profile-img");
    let modal = null;
    const resumeSelector = {
        profile: {
            name: select("#header .profile h1 a"),
            profile_img: select("#header .profile img"),
            twitter_url: select(".social-links .twitter"),
            facebook_url: select(".social-links .facebook"),
            instagram_url: select(".social-links .instagram"),
            skype_url: select(".social-links .google-plus"),
            linkedin_url: select(".social-links .linkedin"),
        },
        hero_section: {
            short_name: select("#hero .hero-container h1"),
            jobs: select("#hero .typed")
        },
        about_section: {
            title: select("#about .section-title p"),
            profile_img: select("#about img"),
            position: select("#about .js-position"),
            personal_details: select("#about .fst-italic"),
            nationality: select("#about .nationality"),
            birthday: select("#about .birthday"),
            marital_status: select("#about .marital_status"),
            gender: select("#about .gender"),
            age: select("#about .age"),
            degree: select("#about .degree"),
            phone_number: select("#about .phone"),
            email: select("#about .email"),
            more_info: select("#about .more_info"),
            certificate: select("#certificate > tbody"),
            professional_summary: select("#about .professional-summary ul")
        },
        skills_section: {
            title: select("#skills .section-title p"),
            skills_left: select("#skills .js-skills-left"),
            skills_right: select("#skills .js-skills-right"),
            practical_experience: {
                programming_language_tools: select("#skills .programming-language-tools"),
                databases: select("#skills .database"),
                cloud_computing: select("#skills .cloud-computing")
            }
        },
        resume_section: {
            title: select("#resume .section-title p"),
            name: select("#resume .name"),
            introduction: select("#resume .introduction"),
            address: select("#resume .address"),
            phone: select("#resume .phone"),
            email: select("#resume .email"),
            education: select("#resume .education"),
            history: select("#resume .history"),
            project_experience: select("#project-experience"),
        },
        contacts: {
            description: select("#contact .section-title p"),
            location: select("#contact .address p"),
            email: select("#contact .email p"),
            phone: select("#contact .phone p"),
            map_url: select("#contact iframe")
        }
    }

    /**
     * Load data from json file
     */
    const resumeJsonData = {
        resume: JSON.parse(localStorage.getItem(RESUME_STORAGE_KEY)) || null,
        setResume: function (key, value) {
            this.resume[key] = value;
            localStorage.setItem(RESUME_STORAGE_KEY, JSON.stringify(this.resume))
        },
        setChildResume: function (parentKey, key, value) {
            let objectParent = this.resume[parentKey]
            for (const k in objectParent) {
                if (k === key) {
                    this.resume[parentKey][key] = value
                    break;
                }
            }

            this.setResume(parentKey, this.resume[parentKey])
        },
        getResume: async () => {
            let r = await fetch('resume.json')
            return await r.json()
        },
        loadResume: async function () {
            this.resume = this.resume || await this.getResume()
        },
        renderSkills: function (skill) {
            return `<div class="progress">
                        <span class="skill">${skill.skill}<i class="val">${skill.percents}%</i></span>
                        <div class="progress-bar-wrap">
                            <div class="progress-bar" role="progressbar" aria-valuenow="${skill.percents}" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                    </div>`
        },
        renderPracticalExperience: function (practical) {
            return `<div class="practical-content">
                        <p class="name"><i class="bi bi-check-circle"></i>${practical.name}</p>
                        <p><span>${practical.years_experience}</span>years experience</p>
                    </div>`
        },
        renderProjectExperience: function (project) {
            const descriptionEl = project.description.map(des => {
                return `<li>${des}</li>`
            }).join('')
            const projectScopeEl = project.project_scope.map(scope => {
                return `<li>${scope}</li>`
            }).join('')
            const runTimeEnvEl = project.technology_used.run_time_env.map(el => {
                return `<li>${el}</li>`
            }).join('')
            const developmentEnvEl = project.technology_used.development_env.map(el => {
                return `<li>${el}</li>`
            }).join('')
            const databaseEl = project.technology_used.databases.map(database => {
                return `<li>${database}</li>`
            }).join('')
            const toolEl = project.technology_used.tools.map(tool => {
                return `<li>${tool}</li>`
            }).join('')

            return `<div class="col-lg-6 table-content" data-aos="fade-up">
                        <table class="table table-hover table-bordered">
                            <thead>
                                <tr>
                                    <th scope="col">Project name</th>
                                    <td scope="col" class="project-name">${project.project_name}</td>
                                    <td scope="col">Duration</td>
                                </tr>
                                <tr>
                                    <th scope="col">Position(s)</th>
                                    <td scope="col" class="positions">${project.positions}</td>
                                    <td scope="col" class="duration">${project.duration}</td>
                                </tr>
                                <tr>
                                    <th colspan="3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <th scope="row">General information</th>
                                    <td colspan="2" class="general-info">${project.general_info}</td>
                                </tr>
                                <tr>
                                    <th scope="row">Description</th>
                                    <td colspan="2">
                                        <ul class="description">
                                            ${descriptionEl}
                                        </ul>
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row">Project Scope</th>
                                    <td colspan="2">
                                        <ul class="scope">
                                            ${projectScopeEl}
                                        </ul>
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row">Technology used</th>
                                    <td colspan="2">
                                        <p class="technology-used">Run-time environment</p>
                                        <ul class="run-time-env">
                                            ${runTimeEnvEl}
                                        </ul>
                                        <p class="technology-used">Development environment</p>
                                        <ul class="development-env">
                                            ${developmentEnvEl}
                                        </ul>
                                        <p class="technology-used">Database</p>
                                        <ul class="database">
                                            ${databaseEl}
                                        </ul>
                                        <p class="technology-used">Tool</p>
                                        <ul class="tool">
                                            ${toolEl}
                                        </ul>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>`
        },
        renderResumeEducation: function (education) {
            return `<div class="resume-item">
                        <h4 class="edu-school-name">${education.school_name}</h4>
                        <h5 class="edu-duration">${education.duration}</h5>
                        <p class="edu-majors"><em>${education.majors}</em></p>
                        <p class="edu-details">${education.details}</p>
                    </div>`
        },
        renderResumeHistory: function (history) {
            return `<div class="resume-item">
                        <h4 class="his-workplace">${history.workplace}</h4>
                        <h5 class="his-duration">${history.duration}</h5>
                        <p class="his-address"><em>${history.address}</em></p>
                        <p class="his-details">${history.details}</p>
                    </div>`
        },
        renderResume: function () {
            try {
                // Profile section
                resumeSelector.profile.name.innerText = this.resume.profile.name
                resumeSelector.profile.profile_img.src = this.resume.profile.profile_img
                resumeSelector.profile.twitter_url.href = this.resume.profile.twitter_url
                resumeSelector.profile.facebook_url.href = this.resume.profile.facebook_url
                resumeSelector.profile.instagram_url.href = this.resume.profile.instagram_url
                resumeSelector.profile.skype_url.href = this.resume.profile.skype_url
                resumeSelector.profile.linkedin_url.href = this.resume.profile.linkedin_url

                // Hero section 
                resumeSelector.hero_section.short_name.textContent = this.resume.hero_section.short_name
                resumeSelector.hero_section.jobs.setAttribute('data-typed-items', this.resume.hero_section.jobs.join())
                resetTyped()

                // About section
                resumeSelector.about_section.title.innerHTML = this.resume.about_section.title
                resumeSelector.about_section.profile_img.src = this.resume.about_section.profile_img
                resumeSelector.about_section.position.innerText = this.resume.about_section.position
                resumeSelector.about_section.personal_details.innerHTML = this.resume.about_section.personal_details
                resumeSelector.about_section.nationality.innerText = this.resume.about_section.nationality
                resumeSelector.about_section.birthday.innerText = this.resume.about_section.birthday
                resumeSelector.about_section.marital_status.innerText = this.resume.about_section.marital_status
                resumeSelector.about_section.gender.innerText = this.resume.about_section.gender
                resumeSelector.about_section.age.innerText = this.resume.about_section.age
                resumeSelector.about_section.degree.innerText = this.resume.about_section.degree
                resumeSelector.about_section.phone_number.innerText = this.resume.about_section.phone_number
                resumeSelector.about_section.email.innerText = this.resume.about_section.email
                resumeSelector.about_section.more_info.innerHTML = this.resume.about_section.more_info
                resumeSelector.about_section.professional_summary.innerHTML = this.resume.about_section.professional_summary.map((li, i) => {
                    return `<li>${li}</li>`
                }).join('')
                resumeSelector.about_section.certificate.innerHTML = this.resume.about_section.certificate.map((tr, i) => {
                    return ` <tr>
                                <th scope="row" index="${i}">${tr.time}</th>
                                <td>${tr.name}</td>
                                <td>${tr.degree}</td>
                            </tr>`
                }).join('')



                // Skills section
                let skill_left_html = this.resume.skills_section.items.filter(x => x.display_side === "left").map(this.renderSkills)
                let skill_right_html = this.resume.skills_section.items.filter(x => x.display_side === "right").map(this.renderSkills)
                let language_tools_html = this.resume.skills_section.practical_experience.programming_language_tools.map(this.renderPracticalExperience)
                let databases_html = this.resume.skills_section.practical_experience.databases.map(this.renderPracticalExperience)
                let cloud_computing_html = this.resume.skills_section.practical_experience.cloud_computing.map(this.renderPracticalExperience)

                resumeSelector.skills_section.title.innerHTML = this.resume.skills_section.title
                resumeSelector.skills_section.skills_left.innerHTML = skill_left_html.join('')
                resumeSelector.skills_section.skills_right.innerHTML = skill_right_html.join('')
                resumeSelector.skills_section.practical_experience.programming_language_tools.innerHTML = language_tools_html.join('')
                resumeSelector.skills_section.practical_experience.databases.innerHTML = databases_html.join('')
                resumeSelector.skills_section.practical_experience.cloud_computing.innerHTML = cloud_computing_html.join('')

                // Resume section
                resumeSelector.resume_section.title.innerHTML = this.resume.resume_section.title
                resumeSelector.resume_section.name.textContent = this.resume.resume_section.name
                resumeSelector.resume_section.introduction.innerHTML = this.resume.resume_section.introduction
                resumeSelector.resume_section.address.textContent = this.resume.resume_section.address
                resumeSelector.resume_section.phone.textContent = this.resume.resume_section.phone
                resumeSelector.resume_section.email.textContent = this.resume.resume_section.email
                resumeSelector.resume_section.project_experience.innerHTML = this.resume.resume_section.project_experience.map(this.renderProjectExperience).join('')
                resumeSelector.resume_section.education.innerHTML = this.resume.resume_section.education.map(this.renderResumeEducation).join('')
                resumeSelector.resume_section.history.innerHTML = this.resume.resume_section.history.map(this.renderResumeHistory).join('')

                // Contact section
                resumeSelector.contacts.description.innerHTML = this.resume.contacts.description
                resumeSelector.contacts.location.textContent = this.resume.contacts.location
                resumeSelector.contacts.email.textContent = this.resume.contacts.email
                resumeSelector.contacts.phone.textContent = this.resume.contacts.phone
                resumeSelector.contacts.map_url.src = this.resume.contacts.map_url
            } catch (error) {
                console.log(error);
            }
        }
    }
    await resumeJsonData.loadResume()
    resumeJsonData.renderResume()

    /**
     * Skills animation
     */
    let skilsContent = select('.skills-content');
    if (skilsContent) {
        new Waypoint({
            element: skilsContent,
            offset: '80%',
            handler: function (direction) {
                let progress = select('.progress .progress-bar', true);
                progress.forEach((el) => {
                    el.style.width = el.getAttribute('aria-valuenow') + '%'
                });
            }
        })
    }

    /**
     * Event onblur edited skills progress
     */
    on('blur', '.progress span', function (e) {
        let newPercent = e.target.lastChild.textContent

        if (Number(newPercent.replace('%', ''))) {
            let progressElement = getParent(e.target, '.progress')
            let progress = progressElement.querySelector('.progress-bar')
            progress.style.width = newPercent
        }
    }, true)

    /**
     * Enable editor mode
     */
    on('click', 'a.enable-editor-mode', function (e) {
        e.preventDefault()

        // Toggle class active
        e.target.classList.toggle('enabled')

        // Check is editor enabled / submit 
        if (e.target.classList.contains("enabled")) {
            // Swich to submit mode
            select('a.enable-editor-mode i').classList.remove("bi-journal-text")
            select('a.enable-editor-mode i').classList.add("bi-save")

            // Profile section
            resumeSelector.profile.name.setAttribute('contenteditable', true)
            resumeSelector.profile.name.focus()

            // Hero hero_section
            resumeSelector.hero_section.short_name.setAttribute('contenteditable', true)

            // Aubout section
            let about_section = resumeSelector.about_section
            for (const key in about_section) {
                if (key === 'profile_img') continue
                if (key === 'professional_summary') {
                    about_section[key].querySelectorAll("li").forEach(li => {
                        li.setAttribute('contenteditable', true)
                    })
                } else {
                    about_section[key].setAttribute('contenteditable', true)
                }
            }
            select('.professional-summary .add-more-li').style.display = 'block'

            // Skills section
            resumeSelector.skills_section.title.setAttribute('contenteditable', true)
            let skills_left = select("#skills .js-skills-left .skill", true)
            let skills_right = select("#skills .js-skills-right .skill", true)
            let skills = [...skills_left, ...skills_right]

            skills.forEach(skill => {
                skill.setAttribute('contenteditable', true)
            });

            let programming_language_tools = resumeSelector.skills_section.practical_experience.programming_language_tools
            let databases = resumeSelector.skills_section.practical_experience.databases
            let cloud_computing = resumeSelector.skills_section.practical_experience.cloud_computing

            let years_experience = [...programming_language_tools.getElementsByTagName('span'),
                ...databases.getElementsByTagName('span'),
                ...cloud_computing.getElementsByTagName('span')
            ]
            let practical_names = [...programming_language_tools.getElementsByClassName('name'),
                ...databases.getElementsByClassName('name'),
                ...cloud_computing.getElementsByClassName('name')
            ]
            years_experience.concat(practical_names).forEach(item => {
                item.setAttribute('contenteditable', true)
            });

            // Resum section
            for (const key in resumeSelector.resume_section) {
                if (!["history", "education"].includes(key)) {
                    resumeSelector.resume_section[key].setAttribute('contenteditable', true)
                }
            }
            let education = [...select("#resume .education .edu-school-name", true),
                ...select("#resume .education .edu-duration", true),
                ...select("#resume .education .edu-majors", true),
                ...select("#resume .education .edu-details", true)
            ]
            let history = [...select("#resume .history .his-workplace", true),
                ...select("#resume .history .his-duration", true),
                ...select("#resume .history .his-address", true),
                ...select("#resume .history .his-details", true)
            ]
            education.concat(history).forEach(item => {
                item.setAttribute('contenteditable', true)
            });


            // Contact section
            for (const key in resumeSelector.contacts) {
                if (key !== "map_url") {
                    resumeSelector.contacts[key].setAttribute('contenteditable', true)
                }
            }


            // Disable Enter key code
            on('keypress', 'body', disableNewlines)
        } else {
            // Swich to submit mode
            select('a.enable-editor-mode i').classList.remove("bi-save")
            select('a.enable-editor-mode i').classList.add("bi-journal-text")
            select('.professional-summary .add-more-li').style.display = 'none'
            select('ul i.bi.bi-trash-fill', true).map(n => n && n.remove())
            select('.li-focus', true).map(n => n && n.classList.remove('li-focus'))


            // Submit data edited
            select('*[contenteditable="true"]', true).forEach(e => {
                e.setAttribute('contenteditable', false)
            })
            editorSubmit()
        }
    })

    /**
     * Event click download resume
     */
    on('click', '#download-resume', function (e) {
        const data = localStorage.getItem(RESUME_STORAGE_KEY)
        download(data, "resume.json")

        // Hide modal confirm download
        if (!modal) {
            modal = new bootstrap.Modal(document.getElementById('js-modal-download'))
        }
        modal.toggle()
    })

    /**
     * Event click add more professional summary
     */
    on('click', '.professional-summary .add-more-li', function (e) {
        appendUlChild()
    })

    /**
     * Event onfocus any li child
     */
    const onFocusLi = () => {
        on('focus', 'li', function (e) {
            if (e.target.getAttribute("contenteditable")) {
                // Remove class 'li-focus' in another element
                select('.li-focus', true).forEach(el => {
                    el.classList.remove('li-focus')
                    select('ul i.bi.bi-trash-fill', true).map(n => n && n.remove())
                })

                e.target.classList.add('li-focus')

                function insertAfter(referenceNode, newNode) {
                    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
                }

                // Create trash icon element
                var el = document.createElement("i");
                el.classList.add('bi', 'bi-trash-fill');
                insertAfter(e.target, el);

                // Add event onclick trash icon
                on('click', 'i.bi.bi-trash-fill', function (e) {
                    e.target.previousElementSibling.remove();
                    e.target.remove();
                }, true)
            }
        }, true)
    }
    onFocusLi()


    /**
     * Submit content after edited
     */
    const editorSubmit = () => {
        const dataEdited = {
            "profile": {
                "name": trimSpaces(resumeSelector.profile.name.innerText),
                "profile_img": resumeSelector.profile.profile_img.getAttribute('src'),
                "twitter_url": resumeSelector.profile.twitter_url.getAttribute('href'),
                "facebook_url": resumeSelector.profile.facebook_url.getAttribute('href'),
                "instagram_url": resumeSelector.profile.instagram_url.getAttribute('href'),
                "skype_url": resumeSelector.profile.skype_url.getAttribute('href'),
                "linkedin_url": resumeSelector.profile.linkedin_url.getAttribute('href')
            },
            "hero_section": {
                "short_name": trimSpaces(resumeSelector.hero_section.short_name.textContent),
                "jobs": resumeSelector.hero_section.jobs.getAttribute('data-typed-items').split(",")
            },
            "about_section": {
                "title": trimSpaces(resumeSelector.about_section.title.innerHTML),
                "profile_img": resumeSelector.about_section.profile_img.getAttribute('src'),
                "position": trimSpaces(resumeSelector.about_section.position.innerText),
                "personal_details": trimSpaces(resumeSelector.about_section.personal_details.innerHTML),
                "nationality": trimSpaces(resumeSelector.about_section.nationality.innerText),
                "birthday": trimSpaces(resumeSelector.about_section.birthday.innerText),
                "marital_status": trimSpaces(resumeSelector.about_section.marital_status.innerText),
                "gender": trimSpaces(resumeSelector.about_section.gender.innerText),
                "age": trimSpaces(resumeSelector.about_section.age.innerText),
                "degree": trimSpaces(resumeSelector.about_section.degree.innerText),
                "phone_number": trimSpaces(resumeSelector.about_section.phone_number.innerText),
                "email": trimSpaces(resumeSelector.about_section.email.innerText),
                "more_info": trimSpaces(resumeSelector.about_section.more_info.innerHTML),
                "certificate": Array.from(resumeSelector.about_section.certificate.querySelectorAll("tr")).map(tr => {
                    return {
                        "time": tr.children[0].textContent,
                        "name": tr.children[1].textContent,
                        "degree": tr.children[2].textContent
                    }
                }),
                "professional_summary": Array.from(resumeSelector.about_section.professional_summary.querySelectorAll("li")).map(li => {
                    return li.textContent
                })
            },
            "skills_section": {
                "title": trimSpaces(resumeSelector.skills_section.title.innerHTML),
                "items": [...getSkillsItem(resumeSelector.skills_section.skills_left, 'left'),
                    ...getSkillsItem(resumeSelector.skills_section.skills_right, 'right')
                ],
                "practical_experience": {
                    "programming_language_tools": getExperienceItems(resumeSelector.skills_section.practical_experience.programming_language_tools),
                    "databases": getExperienceItems(resumeSelector.skills_section.practical_experience.databases),
                    "cloud_computing": getExperienceItems(resumeSelector.skills_section.practical_experience.cloud_computing)
                }
            },
            "resume_section": {
                "title": trimSpaces(resumeSelector.resume_section.title.innerHTML),
                "name": trimSpaces(resumeSelector.resume_section.name.textContent),
                "introduction": trimSpaces(resumeSelector.resume_section.introduction.textContent),
                "address": trimSpaces(resumeSelector.resume_section.address.textContent),
                "phone": trimSpaces(resumeSelector.resume_section.phone.textContent),
                "email": trimSpaces(resumeSelector.resume_section.email.textContent),
                "education": getResumeEducation(resumeSelector.resume_section.education),
                "history": getResumeHistory(resumeSelector.resume_section.history),
                "project_experience": getProjectExperienceItems(resumeSelector.resume_section.project_experience),
            },
            "contacts": {
                "description": trimSpaces(resumeSelector.contacts.description.innerHTML),
                "location": trimSpaces(resumeSelector.contacts.location.textContent),
                "email": trimSpaces(resumeSelector.contacts.email.textContent),
                "phone": trimSpaces(resumeSelector.contacts.phone.textContent),
                "map_url": trimSpaces(resumeSelector.contacts.map_url.src),
            }
        }

        console.log("dataEdited", dataEdited);
        localStorage.setItem(RESUME_STORAGE_KEY, JSON.stringify(dataEdited))

        // Show modal confirm download
        modal = new bootstrap.Modal(document.getElementById('js-modal-download'))
        modal.toggle()
    }

    /**
     * Change avatar
     */
    on('click', '#header .profile img', function (e) {
        inputAva.click()
    })
    on('change', 'input#profile-img', function (event) {
        var image = document.querySelector("#header .profile img")
        image.src = URL.createObjectURL(event.target.files[0])
        resumeJsonData.setChildResume("profile", "profile_img", image.src)
    })

    /**
     * Change profile avatar
     */
    on('click', '#about img', function (e) {
        inputProfile.click()
    })
    on('change', 'input#about-profile-img', function (event) {
        var image = document.querySelector("#about img")
        image.src = URL.createObjectURL(event.target.files[0])
        resumeJsonData.setChildResume("about_section", "profile_img", image.src)
    })

    /**
     * Disable Enter Key while in the editor mode
     */
    const disableNewlines = (event) => {
        const keyCode = event.keyCode || event.which

        if (keyCode === 13) {
            event.returnValue = false
            if (event.preventDefault) event.preventDefault()
        }
    }

    /**
     * Trim all space in text editor.
     */
    const trimSpaces = (string) => {
        return string
            .replace(/&nbsp;/g, '')
            .replace(/&amp;/g, '&')
            .replace(/&gt;/g, '>')
            .replace(/&lt;/g, '<')
    }

    /**
     * Get all skills by selector
     */
    const getSkillsItem = (selector, side) => {
        let items = [...selector.getElementsByClassName('skill')]

        return items.map(item => {
            return {
                "display_side": side,
                "skill": trimSpaces(item.firstChild.textContent),
                "percents": +trimSpaces(item.lastChild.textContent.replace('%', ''))
            }
        })
    }

    /**
     * Get Practical experience
     */
    const getExperienceItems = (selector) => {
        let items = [...selector.getElementsByClassName('practical-content')]

        return items.map(item => {
            return {
                "name": trimSpaces(item.getElementsByClassName('name')[0].innerText),
                "years_experience": +trimSpaces(item.getElementsByTagName('span')[0].textContent)
            }
        })
    }

    /**
     * Get Project experience
     */
    const getProjectExperienceItems = (selector) => {
        let tables = [...selector.getElementsByClassName('table-content')]

        return tables.map(item => {
            return {
                "project_name": trimSpaces(item.querySelector('.project-name').innerText),
                "positions": trimSpaces(item.querySelector('.positions').innerText),
                "duration": trimSpaces(item.querySelector('.duration').innerText),
                "general_info": trimSpaces(item.querySelector('.general-info').innerText),
                "description": [...item.querySelectorAll('.description li')].map(el => el.innerText),
                "project_scope": [...item.querySelectorAll('.scope li')].map(el => el.innerText),
                "technology_used": {
                    "run_time_env": [...item.querySelectorAll('.run-time-env li')].map(el => el.innerText),
                    "development_env": [...item.querySelectorAll('.development-env li')].map(el => el.innerText),
                    "databases": [...item.querySelectorAll('.database li')].map(el => el.innerText),
                    "tools": [...item.querySelectorAll('.tool li')].map(el => el.innerText),
                }
            }
        })
    }

    /**
     * Get Resume Education
     */
    const getResumeEducation = (selector) => {
        let items = [...selector.getElementsByClassName('resume-item')]

        return items.map(education => {
            return {
                "school_name": trimSpaces(education.getElementsByClassName('edu-school-name')[0].innerText),
                "duration": trimSpaces(education.getElementsByClassName('edu-duration')[0].innerText),
                "majors": trimSpaces(education.getElementsByClassName('edu-majors')[0].innerText),
                "details": trimSpaces(education.getElementsByClassName('edu-details')[0].innerText),
            }
        })
    }

    /**
     * Get Resume History
     */
    const getResumeHistory = (selector) => {
        let items = [...selector.getElementsByClassName('resume-item')]

        return items.map(history => {
            return {
                "workplace": trimSpaces(history.getElementsByClassName('his-workplace')[0].innerText),
                "duration": trimSpaces(history.getElementsByClassName('his-duration')[0].innerText),
                "address": trimSpaces(history.getElementsByClassName('his-address')[0].innerText),
                "details": trimSpaces(history.getElementsByClassName('his-details')[0].innerText),
            }
        })
    }

    /**
     * Append a li child in the ul element.
     */
    const appendUlChild = (content = "") => {
        var ul = select("#about .professional-summary ul");
        var li = document.createElement("li");

        li.appendChild(document.createTextNode(content));
        li.setAttribute('contenteditable', true);
        ul.appendChild(li);

        // Re-listener event add icon trash
        onFocusLi();
    }
})()