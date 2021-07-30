const { promises: fs } = require('fs');
const path = require('path');
const remark = require('remark');
const html = require('remark-html');
const frontmatter = require('remark-frontmatter');
const extract = require('remark-extract-frontmatter');
const yaml = require('yaml').parse;
const toHTML = remark()
  .use(html)
  .use(frontmatter, ['yaml'])
  .use(extract, { yaml: yaml });

const photosPerPage = 10;

const writeFile = async (target, data) =>
  fs.writeFile(target, JSON.stringify(data), 'utf-8');

const parse = async (el) =>
  new Promise((resolve, reject) =>
    toHTML.process(el, (err, file) => {
      if (err !== undefined && err !== null) return reject(err);
      return resolve({
        ...file.data,
        html: file.contents.length > 0 ? file.contents : undefined,
      });
    }),
  );

const main = async () => {
  const dataFolder = path.join(process.cwd(), 'data-js', 'photos');
  await fs.mkdir(dataFolder, {
    recursive: true,
  });

  return Promise.all([
    // Albums
    fs
      .readdir(path.join(process.cwd(), 'data', 'albums'))
      .then(async (files) => {
        const albums = await Promise.all(
          files
            .filter((s) => s.endsWith('.md'))
            .map(async (album) => ({
              slug: album.replace(/\.md$/, ''),
              doc: await parse(
                await fs.readFile(
                  path.join(process.cwd(), 'data', 'albums', album),
                  'utf-8',
                ),
              ),
            })),
        );

        albums.sort(({ doc: { createdAt: a } }, { doc: { createdAt: b } }) =>
          b.localeCompare(a),
        );

        await writeFile(
          path.join(process.cwd(), 'data-js', `albums.json`),
          albums.reduce((albums, album) => {
            const { slug, doc } = album;
            return {
              ...albums,
              [slug]: doc,
            };
          }, {}),
        );
      }),
    // Photos
    fs
      .readdir(path.join(process.cwd(), 'data', 'photos'))
      .then(async (files) => {
        const photos = files.filter((s) => s.endsWith('.md'));
        await writeFile(path.join(process.cwd(), 'data-js', `stats.json`), {
          photos: photos.length,
        });
        const tags = {};
        const photoDocs = await Promise.all(
          photos.map(async (f) => {
            const p = path.parse(f);
            const source = path.join(process.cwd(), 'data', 'photos', f);
            const target = path.join(
              process.cwd(),
              'data-js',
              'photos',
              `${p.name}.json`,
            );
            const doc = await parse(await fs.readFile(source, 'utf-8'));
            const slug = path.parse(f).name;
            doc.tags?.map((tag) => {
              if (tags[tag] === undefined) {
                tags[tag] = [slug];
              } else {
                tags[tag].push(slug);
              }
            });
            const sourceModified = (await fs.stat(source)).mtime;
            let targetModified = -1;
            try {
              targetModified = (await fs.stat(target)).mtime;
            } catch {}
            if (targetModified < sourceModified) {
              await writeFile(target, doc);
            }
            return { slug, doc };
          }),
        );
        // Write paginated, sorted photos pages
        photoDocs.sort(({ doc: { takenAt: a } }, { doc: { takenAt: b } }) =>
          b.localeCompare(a),
        );
        const photoPages = photoDocs.reduce(
          (chunks, { slug }) => {
            if ((chunks[chunks.length - 1].length ?? 0) >= photosPerPage) {
              chunks.push([]);
            }
            chunks[chunks.length - 1].push(slug);
            return chunks;
          },
          [[]],
        );
        await Promise.all(
          photoPages.map((page, k) =>
            writeFile(
              path.join(process.cwd(), 'data-js', `photos-takenAt-${k}.json`),
              page,
            ),
          ),
        );
        // Write tags
        await writeFile(
          path.join(process.cwd(), 'data-js', `photos-tags.json`),
          Object.entries(tags)
            .sort(([, v1], [, v2]) => v2.length - v1.length)
            .filter(([, v]) => v.length > 1)
            .reduce((t, [k, v]) => ({ ...t, [k]: v })),
        );
      }),
  ]);
};

main();
