# Publishing To GitHub

This repository is prepared for GitHub publication.

Recommended repository name:

```text
TheParasites_BodyMorpher
```

## Important License Note

The source code is made available under a custom restricted source-available
license.

When creating the GitHub repository, do not select a standard open-source
license template. The custom terms are already included in:

```text
LICENSE.md
COPYRIGHT_AND_TERMS.txt
```

Third-party components remain under their own licenses. See:

```text
THIRD_PARTY_NOTICES.md
licenses\Node.js-LICENSE.txt
licenses\Koffi-MIT-LICENSE.txt
licenses\node-stream-zip-MIT-LICENSE.txt
licenses\oodle-js-ISC-LICENSE.txt
```

The Oodle notice follows the substance of the WorkingRobot/OodleUE EULA notice:

```text
https://github.com/WorkingRobot/OodleUE#eula-notice
```

Oodle DLLs are included only for Oodle-compatible save chunk handling. Users are
responsible for complying with applicable Unreal Engine/Oodle terms. This
package does not claim ownership of Oodle, Unreal Engine code, Epic server
artifacts, or related build artifacts. If Epic Games Tools LLC, RAD Game Tools,
Epic Games, or another authorized rightsholder does not want those DLLs public
here, remove them from the package and repository or work out a viable
alternative solution before publishing another release.

The license prohibits commercial use and hosting this tool, its source code,
release archives, forks, mirrors, modified versions, or derivative packages on
another website, file host, launcher, mod manager, package registry, repository
hosting service, or repository outside the official repository controlled by the
copyright holder.

## Push The Local Repository

Run these commands from this local repository folder:

```powershell
cd "<local repository folder>"
git remote add origin https://github.com/YOUR_GITHUB_NAME/TheParasites_BodyMorpher.git
git push -u origin main
git push origin v1.0.0
```

If you use SSH instead of HTTPS:

```powershell
cd "<local repository folder>"
git remote add origin git@github.com:YOUR_GITHUB_NAME/TheParasites_BodyMorpher.git
git push -u origin main
git push origin v1.0.0
```

## Create The GitHub Release

1. Open the GitHub repository.
2. Go to Releases.
3. Draft a new release.
4. Select the existing tag:

```text
v1.0.0
```

5. Release title:

```text
The Parasites BodyMorpher v1.0.0
```

6. Paste the contents of:

```text
RELEASE_NOTES_v1.0.0.md
```

7. Attach the release ZIP:

```text
<release ZIP path>\TheParasites_BodyMorpher_v1.0.0.zip
```

8. Publish the release.
