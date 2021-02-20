import React from 'react';

interface Lights {
    active: boolean;
    className?: string;
    width?: number | string;
    height?: number | string;
}

const Lights: React.FC<Lights> = ({ active, className, width, height }) => {

    const col = active ? '#f1b7c9' : '#fff';

    return (
        <svg width={width} height={height} className={className} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 43 44">
            <defs>
                <linearGradient id="a" x1="14.62" y1="11.13" x2="20.45" y2="20.03" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#f0f0f0" stopOpacity="0.3" />
                    <stop offset="0.98" stopColor="#ededed" stopOpacity="0.3" />
                </linearGradient>
            </defs>
            <g style={{ isolation: 'isolate' }}>
                <g>
                    <g>
                        <g>
                            <circle cx="17.17" cy="15.02" r="5.63" style={{ fill: 'url(#a)' }} />
                        </g>
                        <circle cx="17.17" cy="15.02" r="3.96" style={{ fill: 'url(#a)' }} />
                    </g>
                    <g>
                        <g>
                            <image width="43" height="44" xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAtCAYAAADV2ImkAAAACXBIWXMAAAsSAAALEgHS3X78AAADNElEQVRYR+2Z6XLiMBCEGwyBZPdteP9H4G32CKf3B2rcakYHFLsVqrarpuRDJp/HrZHszMZxxCtp3urw1fRywItWhx5tt9tZq89ms3mK92aPergHsqZHb+BuYAN16Ogm/A9k+/eCdwMXQL31bSAHHAttN3gXsMBq69sRfAQ4BvsA+qCbwAbbG1QEOgI42/61bwu6ClyBnUs7t2MO7KBn2daW/avQReAC7LwQA3JgXuugZwAn21dwXlOEDutwB+xQCM+ywp5SzGWbOqdrmh7umekceMDlRpcA3gCsAKxTvBdinfqt0jXL9Bu8SbXWDCjX+ZsMN7KrsAq9kOAfBqbsHlMc7LxqtONhtlsZrgFrZj8AfJP4Lu1HCs10KcvZjURZLq0lZkGU7OCPmgDA5NUDgB1yKB+M53Q+qxiu2uKnBKvAa4kVpqwp8BHAHvmNENYrBm2hbaYMuGB0rw7RgOPjpp8V+GDHCHpMx7V6sFoUK0bJw7WB51lW6HdMntVQ79I6ap+sQqg8iS1L6HYt0+pngoyYMgdM1eKQ+qhNFDZ6yldFwA4aZVknC4Iz3pBbgi2fjE4ynt0qLND/xlGziGdeBxeC4wSsgRZ9XPKwq1pqTNqnp/9d6s2wKlrQ+FqB8nO+2BklVNExADGwTpH6gxEcBxFL15CuU+/u03lOzw5fA79RLcNqA4UmKGH3yOvsETk4Z7kdJvgDcnCFrUKXgHWm0exqZgnqU/Ey7fM63tQnYmjPciZfF2eDzk6OFm6DPS4AnwB+A/iV4keKnyl4nMA73Fqk2xqtQRdl+Ii8PAHTpMCs+3G9Qc2ye7ppjZolgMkWDqy1k9nn2mBADuxPhRH5uGgNKnynS/O3Bn26kFhaqJ/p4chKGlHluNoieq/rqRLA5YeAqVzxvGbQ3+uiPlph3MM+ZkK13pr5h3U6HQqhUzSlY+BUiKge3/fWLBqRz+nMtIP4Qkal/mT/s0U1q6pnfEjxlv2B28esgN6y/2MfUqjKdzVfbamFFJitg7tfm7BABzBw98dA7TcGrUNeAVqwQCcw8GKfW1Uv80Hb9TL/MiipdQOPArqeBvyv1PtO92X0H/hv6w94XRLKFjyVjAAAAABJRU5ErkJggg==" style={{ opacity: 0.5, mixBlendMode: 'multiply' }} />
                            <circle cx="17.17" cy="15.02" r="5.63" style={{ fill: '#fff' }} />
                        </g>
                        <circle cx="17.17" cy="15.02" r="3.96" style={{ fill: col }} />
                    </g>
                </g>
            </g>
        </svg>

    )
}

export default Lights;