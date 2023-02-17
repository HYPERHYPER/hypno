import Head from 'next/head';
import Image from 'next/image';
import { useLayoutEffect, useState } from 'react';

const ContactPage = () => {
    const [submitted, setSubmitted] = useState<boolean>(false);
    useLayoutEffect(() => {
        const formElem = document.getElementById("webToLeadForm");
        if (formElem) {
            formElem.addEventListener("submit", () => {
                setSubmitted(true);
            })
        }
    }, [])

    return (
        <>
            <Head>
                <title>Contact Us @ Hypno</title>
                <meta name="description" content="Capture, Customize, Share easier than ever." />
            </Head>

            <main className='w-screen bg-black min-h-screen min-w-screen p-10'>
                <div className='flex justify-center'>
                    <Image className='h-auto' src={'https://hypno-web-assets.s3.amazonaws.com/hypno-logo-white-drop.png'} alt={"Hypno logo"} width={150} height={150} priority />
                </div>

                <section className='hero min-h-screen h-full mt-8'>
                    <div className='hero-content sm:w-[600px] p-0 sm:p-10 flex flex-col items-start'>
                        <h1 className='text-white text-lg'>Contact us</h1>
                        {submitted && (
                            <p>Thank you! <br /> Your information has been sent.</p>
                        )}
                        <form
                            action="https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8"
                            method="POST"
                            id="webToLeadForm"
                            className='w-full'
                        >
                            <input hidden name="oid" value="00D1U000000pWOY" readOnly />
                            <input hidden name="retURL" value="http://www.hypno.com" readOnly />
                            <div className='gap-x-6 gap-y-3 grid grid-cols-1 sm:grid-cols-1'>
                                <div className='form-control'>
                                    <label className='label' htmlFor="first_name">
                                        <span className='label-text'>First Name</span>
                                    </label>
                                    <input
                                        id="first_name"
                                        maxLength={40}
                                        name="first_name"
                                        size={20}
                                        type="text"
                                        className='input'
                                    />
                                </div>

                                <div className='form-control'>
                                    <label className='label' htmlFor="last_name">
                                        <span className='label-text'>Last Name</span>
                                    </label>
                                    <input
                                        id="last_name"
                                        maxLength={40}
                                        name="last_name"
                                        size={20}
                                        type="text"
                                        className='input'
                                    />
                                </div>

                                <div className='form-control'>
                                    <label className='label' htmlFor="email">
                                        <span className='label-text'>Email</span>
                                    </label>
                                    <input
                                        id="email"
                                        maxLength={80}
                                        name="email"
                                        size={20}
                                        type="text"
                                        className='input'
                                    />
                                </div>

                                <div className='form-control'>
                                    <label className='label' htmlFor="phone">
                                        <span className='label-text'>Phone</span>
                                    </label>
                                    <input
                                        id="phone"
                                        maxLength={40}
                                        name="phone"
                                        size={20}
                                        type="text"
                                        className='input'
                                    />
                                </div>

                                <div className='form-control'>
                                    <label className='label' htmlFor="company">
                                        <span className='label-text'>Company</span>
                                    </label>
                                    <input
                                        id="company"
                                        maxLength={40}
                                        name="company"
                                        size={20}
                                        type="text"
                                        className='input'
                                    />
                                </div>

                                <div className='form-control'>
                                    <label className='label' htmlFor="00N1U00000U2QLp">
                                        <span className='label-text'>Inquiry Type</span>
                                    </label>
                                    <select
                                        id="00N1U00000U2QLp"
                                        name="00N1U00000U2QLp"
                                        title="Inquiry Type"
                                        className='select w-full'
                                    >
                                        <option value="Partnership">Partnership</option>
                                        <option value="Private Event">Private Event</option>
                                        <option value="Other">Other</option>
                                        <option value="Platform">Platform</option>
                                        <option value="Experience Museum">
                                            Attractions &amp; Experiences
                                        </option>
                                        <option value="Event Photography">Event Photography</option>
                                        <option value="Experiential Activation">
                                            Experiential Activation
                                        </option>
                                        <option value="Retail">Retail</option>
                                        <option value="Virtual">Virtual</option>
                                    </select>
                                </div>
                                <div />
                                <div className='form-control'>
                                    <label className='label' htmlFor="description">
                                        <span className='label-text'>Description</span>
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        className='textarea'
                                        rows={6}
                                    />
                                </div>
                            </div>

                            <div className='mt-8'>
                                <input className='float-right btn btn-wide rounded-full border-none bg-white text-black hover:bg-white/90 hover:text-black' type="submit" name="submit" />
                            </div>
                        </form>
                    </div>
                </section>
            </main>
        </>
    )
}

export default ContactPage;
