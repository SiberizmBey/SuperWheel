SuperWheel Launcher - Teknik Dokümantasyon
SuperWheel, kullanıcıların operasyonel verimliliğini artırmak amacıyla NexaBAG Studios tarafından geliştirilmiş, düşük gecikmeli ve dairesel (radial) arayüze sahip bir uygulama başlatıcıdır. Bu proje, masaüstü karmaşasını minimize ederken en sık kullanılan araçlara erişimi tek bir merkezde toplar.

![](SW.gif)

# 1. Projenin Amacı ve Kapsamı
SuperWheel, minimalist bir tasarım felsefesiyle açık kaynak kodlu olarak geliştirilmiştir. Uygulamanın temel amacı, klavye ve fare etkileşimini optimize ederek yazılım başlatma süreçlerini hızlandırmaktır.

# 2. Temel Fonksiyonlar
Dinamik Dairesel Menü: Kullanıcı odaklı, akıcı animasyonlarla desteklenmiş radial arayüz.

Düşük Sistem Kaynağı Tüketimi: Electron altyapısı üzerinde optimize edilmiş performans.

Gelişmiş Hook Sistemi: uiohook-napi kütüphanesi ile global giriş (input) takibi.

Kalıcı Yapılandırma: electron-store entegrasyonu ile kullanıcı tercihlerinin şifrelenmiş veya yerel olarak saklanması.

Sistem Tepsisi Operasyonları: Arka planda kesintisiz çalışma ve hızlı erişim menüsü.

# 3. Kurulum ve Dağıtım
3.1. Son Kullanıcı İçin Kurulum
Uygulama portable şekilde dağıtılır. Kurulum gerektirme

3.2. Geliştirici Ortamı Kurulumu
Projenin kaynak kodlarını yerel ortamda derlemek için aşağıdaki adımları takip ediniz:

# Deponun klonlanması
git clone https://github.com/nexabag/superwheel.git

# Bağımlılıkların yüklenmesi
npm install

# Uygulamanın geliştirme modunda çalıştırılması
npm start

# Kurulum paketinin (Installer) oluşturulması
npm run dist
4. Kullanım Talimatları
Aktivasyon: Varsayılan olarak farenin orta tuşu (Button 3) ile menü aktif hale getirilir.

Navigasyon: Fare tekerleği (Scroll) aracılığıyla uygulamalar arasında geçiş sağlanır.

Yürütme: Sol tıklama ile hedeflenen uygulama başlatılır.

5. Lisans ve Telif Hakları
Bu yazılım GNU General Public License (GPL) kapsamında sunulmaktadır. Yazılımın açık kaynak kodlu doğası gereği; kopyalanması, değiştirilmesi ve her türlü ortamda dağıtılması tamamen serbesttir. Bu özgürlük, yazılımın tüm türevleri için de geçerlidir.

NexaBAG Studios - Gelişmiş Neslin Temeli