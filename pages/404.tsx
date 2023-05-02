import Head from 'next/head'
import _ from 'lodash';
import useUserStore from '@/store/userStore';
import { GlobalNav } from '@/components/GlobalNav';
import GlobalLayout from '@/components/GlobalLayout';
import Link from 'next/link';
import axios from 'axios';
import { GetServerSideProps } from 'next';
import nookies from 'nookies'
import Modal from '@/components/Modal';
import FormControl from '@/components/Form/FormControl';
import withAuth from '@/components/hoc/withAuth';

export default withAuth(NotFoundPage, 'optional');
function NotFoundPage() {
    return (
        <>
            <Head>
                <title>oops! | hypno™</title>
                <meta name="description" content="shoot + share professionally branded content — in seconds — from live events, shoots, stores and more. trusted by NBA, Dolby, TikTok, Apple, Bacardi, New Balance and other world-class brands." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <GlobalLayout>
                <GlobalLayout.Header
                    title='oops! 404!'
                >
                    <h2>this page does not exist or you don't have access...</h2>
                </GlobalLayout.Header>
            </GlobalLayout>
        </>
    )
}


