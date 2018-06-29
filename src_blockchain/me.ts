import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs';

export class Me {
    name: string = "";

    file: string = 'user.txt';

    load() {
        if (existsSync(this.file)) {
            const buffer = readFileSync(this.file, 'utf8');
            this.name = buffer.toString();
        }
    }

    save() {
        if (!existsSync(this.file)) {
            writeFileSync(this.file, this.name);
        }
    }
}