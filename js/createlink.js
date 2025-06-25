$(document).ready(function() {
  $(document)
    .on('click', '.ClipOuter', loadToCollection)
});


function selectClip(event) {
  event.preventDefault();
  $('.CurrentClip').removeClass('CurrentClip');
  $(this).addClass('CurrentClip');
}

function loadToCollection() {
  window.location = '/Collection/' + $(this).data('collectionid') + '?clipId=' + $(this).data('clipid');
}

/*

  <div class="ClipOuter" data-clipid="ABCD" data-collectionid="1234">
    <img src="./imgs/Dino.png">
    <small>Dummy Link</small>
  </div>

  Should return:

  https://thorium.rocks/Collection/1234?clipId=ABCD

*/
