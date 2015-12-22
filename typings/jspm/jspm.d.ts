declare module 'jspm' {

    interface IPackageManager {
        normalize(package: string): Promise<string>;
    }

    let jspm: IPackageManager;

    export default jspm;
}
